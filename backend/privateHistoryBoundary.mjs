// Private legacy history boundary. Retention/time checks never create source admission.
import {createHash} from 'node:crypto';
import {copy,freeze} from '../shared/oceanPublication.mjs';
import {exactJson} from './exactScientificEvidence.mjs';
import {requireScientificAssessmentV1} from './scientificAssessment.mjs';
export const PRIVATE_HISTORY_BOUNDARY_V1='pelora-private-as-used-history-boundary-v1';
export const HISTORY_CONSUMERS_V1=Object.freeze(['buildOceanChangeFromTimeSeries','buildPersistenceEvidence','buildSeaSurfaceTemperaturePersistence','buildCurrentPersistence','buildCurrentEdgePersistence','buildCurrentShearPersistence','buildCurrentConvergencePersistence','buildEnvironmentalTransitionPersistence','buildSurfaceWaterCharacterPersistence','buildWaterMassPersistence','buildMixingZonePersistence','buildOceanFrontPersistence','buildProductivityPersistence','buildClarityPersistence']);
const digest=x=>createHash('sha256').update(exactJson(x)).digest('hex');
const ms=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))?Date.parse(x):null;
const controlledAuthorities=new WeakMap();
// Explicit controlled comparison port only. It cannot assert operational source authority.
export function controlledHistoryAuthorityV1(rows,facts){
 const retained=copy(rows),metadata=copy(facts);
 if(retained.length!==metadata.length)throw TypeError('Controlled history correspondence');
 const handle=Object.freeze({scope:'CONTROLLED_FIXTURE_ONLY_NOT_SOURCE_ADMISSION'});
 const bindings=new Map();
 for(const [i,row] of retained.entries()){const key=digest(row);if(bindings.has(key)&&exactJson(bindings.get(key))!==exactJson(metadata[i]))throw TypeError('Conflicting controlled parent binding');bindings.set(key,metadata[i]);}
 controlledAuthorities.set(handle,bindings);
 return handle;
}
const rowTimes=row=>[row.observed_at,row.snapshot_payload?.metadata?.time?.observedAt,row.snapshot_payload?.observation?.observedAt];
function consumedTimes(row,consumer){
 const p=row.snapshot_payload, times=rowTimes(row);
 if(consumer==='buildOceanChangeFromTimeSeries')times.push(p?.intelligence?.observedAt);
 for(const family of ['productivity','clarity'])if(consumer===`build${family==='productivity'?'Productivity':'Clarity'}Persistence`||consumer==='buildOceanChangeFromTimeSeries'){
  const leaf=p?.observation?.evidence?.groups?.[family]?.values?.observedAt;
  if(leaf!==undefined&&leaf!==null)times.push(leaf); // No envelope substitution for a supplied preferred leaf.
 }
 return times.filter(t=>t!==undefined&&t!==null);
}
function timeReason(times,cutoff){
 if(!times.length||times.some(t=>ms(t)===null))return 'INVALID_CONSUMED_TIME';
 return times.some(t=>ms(t)>cutoff)?'FUTURE_CONSUMED_EVIDENCE':null;
}
function authorityReason(fact,cutoff){
 if(!fact)return 'UNKNOWN_SUPPORT_AND_EXACT_VINTAGE_POSSESSION';
 const support=fact.support;
 if(!support||support.kind==='unknown')return 'UNKNOWN_TEMPORAL_SUPPORT';
 if(support.kind==='instant'){
  if(ms(support.at)===null)return 'INVALID_SUPPORT';
  if(ms(support.at)>cutoff)return 'FUTURE_SUPPORT';
 }else if(['interval','composite-window'].includes(support.kind)){
  if(ms(support.start)===null||ms(support.end)===null||ms(support.start)>ms(support.end))return 'INVALID_SUPPORT';
  if(ms(support.end)>cutoff)return 'SUPPORT_STRADDLES_OR_FOLLOWS_CUTOFF';
 }else return 'UNRESOLVED_SUPPORT_CLASS';
 if(ms(fact.possessedAt)===null||!fact.parentReference)return 'UNPROVEN_EXACT_VINTAGE_POSSESSION';
 if(ms(fact.possessedAt)>cutoff)return 'EXACT_VINTAGE_POSSESSED_AFTER_CUTOFF';
 return null;
}
export function resolvePrivateHistoryBoundaryV1({assessment,context,retrieval,adaptRow,querySnapshots,buildSeries,controlledAuthority=null,constructedAt}){
 const explicit=requireScientificAssessmentV1(assessment),cutoff=Date.parse(explicit.assessmentAt);
 if(ms(constructedAt)===null)throw TypeError('Explicit selection construction time required');
 const scope=copy(context);
 if(scope.scope!=='PRIVATE_CURRENT_WORKFLOW_ONLY'||!Number.isFinite(scope.latitude)||!Number.isFinite(scope.longitude))throw TypeError('Private history context required');
 const returned=copy(retrieval),facts=controlledAuthorities.get(controlledAuthority);
 if(controlledAuthority&&!facts)throw TypeError('Untrusted controlled history port');
 const rows=returned.rows??[], inspected=[], byIdentity=new Map();let invalid=returned.limitations?.includes('invalid-ocean-memory-response-body')===true;
 if(!Array.isArray(rows))throw TypeError('Invalid history rows');
 for(const row of rows){
  const contentDigest=digest(row);
  if(!row||typeof row!=='object'||Array.isArray(row)){invalid=true;inspected.push({contentDigest,reason:'CORRUPT_ROW_BINDING'});continue;}
  const snapshotId=row.snapshot_id;
  const previous=byIdentity.get(snapshotId);
  if(previous&&previous!==contentDigest){invalid=true;inspected.push({contentDigest,reason:'CONFLICTING_DUPLICATE_IDENTITY'});continue;}
  if(previous){inspected.push({contentDigest,reason:'EXACT_DUPLICATE_REUSE'});continue;}
  byIdentity.set(snapshotId,contentDigest);
  let adapted=null,adaptationFailed=false;
  try { adapted=adaptRow({row,assessment:explicit}); } catch { adaptationFailed=true; }
  const coordinateMatch=row.latitude===scope.latitude&&row.longitude===scope.longitude;
  const reason=adaptationFailed?'CORRUPT_ROW_BINDING':timeReason(rowTimes(row),cutoff)??(!adapted?.available?'CORRUPT_ROW_BINDING':(!Number.isFinite(row.latitude)||!Number.isFinite(row.longitude))?'SPATIAL_CONTEXT_UNRESOLVED':!coordinateMatch?'SPATIAL_CONTEXT_MISMATCH':null);
  if(reason?.startsWith('CORRUPT')||reason?.startsWith('INVALID')||reason==='SPATIAL_CONTEXT_MISMATCH')invalid=true;
  inspected.push({contentDigest,reason,representedTimeCheck:timeReason(rowTimes(row),cutoff)===null?'PASSED_NECESSARY_CHECK_ONLY':'REJECTED',row,adapted,authority:facts?.get(contentDigest)??null});
 }
 // Equal-target different identities require a policy choice, never stable-sort/latest-wins.
 const targetGroups=new Map();
 for(const x of inspected.filter(x=>x.row&&!x.reason)){
  const key=ms(x.row.observed_at),group=targetGroups.get(key)??[];group.push(x);targetGroups.set(key,group);
 }
 for(const x of inspected)if(x.row && (authorityReason(x.authority,cutoff)?.startsWith('INVALID')||HISTORY_CONSUMERS_V1.some(name=>timeReason(consumedTimes(x.row,name),cutoff)==='INVALID_CONSUMED_TIME')))invalid=true;
 if(new Set(rows.map(row=>row?.user_id)).size>1)invalid=true;
 for(const group of targetGroups.values())if(group.length>1)for(const x of group)x.reason='SAME_TARGET_REVISION_SELECTION_UNRESOLVED';
 const available=returned.available===true&&returned.summary?.responseOk===true;
 const selections={};
 for(const consumer of HISTORY_CONSUMERS_V1){
  const decisions=inspected.map(x=>({contentDigest:x.contentDigest,reason:x.reason??timeReason(consumedTimes(x.row,consumer),cutoff)??authorityReason(x.authority,cutoff)}));
  const eligible=inspected.filter((x,i)=>decisions[i].reason===null);
  const selected=invalid||!available?[]:eligible.map(x=>x.adapted);
  const query=querySnapshots({historicalSnapshots:selected,assessment:explicit,observedBefore:explicit.assessmentAt});
  const series=buildSeries({historicalSnapshots:query.historicalSnapshots,assessment:explicit,observedBefore:explicit.assessmentAt});
  const inputs=copy(series.historicalSnapshots);
  selections[consumer]={decisions,inputs,inputDigest:digest(inputs),state:invalid?'INVALID':!available?'UNAVAILABLE':!rows.length?'UNRESOLVED':!inputs.length&&decisions.some(d=>d.reason?.includes('UNKNOWN')||d.reason?.includes('UNRESOLVED')||d.reason?.includes('UNPROVEN')||d.reason?.includes('POSSESSED_AFTER'))?'UNRESOLVED':inputs.length<2?'INSUFFICIENT':'CONTROLLED_COMPUTABLE_NOT_OPERATIONALLY_ADMITTED'};
 }
 const state=invalid?'INVALID':!available?'UNAVAILABLE':rows.length===0?'UNAVAILABLE':rows.length>=48?'BOUNDED_TRUNCATION_POSSIBLE':Object.values(selections).some(s=>s.inputs.length)?'CONTROLLED_RESOLVED':'UNRESOLVED';
 const reason=invalid?'CORRUPT_OR_CONFLICTING_BINDING':!available?'READ_FAILED_OR_SOURCE_UNAVAILABLE':rows.length===0?'ABSENT_ROWS_NOT_GOVERNED_EMPTY':state==='UNRESOLVED'?'NO_SCIENTIFICALLY_ADMITTED_HISTORY':state==='BOUNDED_TRUNCATION_POSSIBLE'?'TECHNICAL_PAGE_NOT_COMPLETE_SCOPE':'CONTROLLED_INPUTS_ONLY';
 const record={contractVersion:PRIVATE_HISTORY_BOUNDARY_V1,scope:'PRIVATE_CURRENT_WORKFLOW_ONLY',mode:facts?'CONTROLLED_FIXTURE_ONLY':'LEGACY_AUTHORITY_UNRESOLVED',assessment:explicit,selectionConstructedAt:constructedAt,context:scope,resolution:{state,reason,returnedCount:rows.length,completeScope:false},admission:'NOT_OPERATIONALLY_ADMITTED',retrievalFacts:{available:returned.available===true,responseOk:returned.summary?.responseOk===true,bodyInvalid:returned.limitations?.includes('invalid-ocean-memory-response-body')===true},returnedRows:rows,inspected:inspected.map(({row,adapted,authority,...x})=>({...x,authority:authority??null})),selections};
 const selectionId='phb1-'+digest(record);
 return freeze({...record,selectionId});
}
export function replayPrivateHistoryBoundaryV1(record,assessment,context){
 const snapshot=copy(record),explicit=requireScientificAssessmentV1(assessment);
 const {selectionId,...content}=snapshot;
 if(content.contractVersion!==PRIVATE_HISTORY_BOUNDARY_V1||selectionId!=='phb1-'+digest(content)||exactJson(content.assessment)!==exactJson(explicit)||exactJson(content.context)!==exactJson(copy(context)))throw TypeError('Private history replay binding conflict');
 if(content.admission!=='NOT_OPERATIONALLY_ADMITTED'||content.scope!=='PRIVATE_CURRENT_WORKFLOW_ONLY'||!['CONTROLLED_FIXTURE_ONLY','LEGACY_AUTHORITY_UNRESOLVED'].includes(content.mode))throw TypeError('History admission conflict');
 for(const selection of Object.values(content.selections))if((content.mode==='LEGACY_AUTHORITY_UNRESOLVED'&&selection.inputs.length)||selection.inputDigest!==digest(selection.inputs))throw TypeError('Private history input conflict');
 return freeze(snapshot);
}
// Safe additive diagnostics only. Never return private rows, IDs, locations or auth material.
export function privateHistoryBoundarySummaryV1(record){
 return freeze({contractVersion:record.contractVersion,scope:record.scope,selectionId:record.selectionId,assessment:record.assessment,selectionConstructedAt:record.selectionConstructedAt,resolution:record.resolution,admission:record.admission,consumers:Object.fromEntries(Object.entries(record.selections).map(([name,s])=>[name,{state:s.state,inputDigest:s.inputDigest,inputCount:s.inputs.length,reasons:[...new Set(s.decisions.map(x=>x.reason).filter(Boolean))]}]))});
}
