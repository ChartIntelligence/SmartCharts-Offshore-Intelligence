// Inventory accounting only. This does not grant projection authority.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import registry from '../../../docs/Candidate_Semantic_Surfaces_v1.json' with {type:'json'};
import {exactJson} from '../../exactScientificEvidence.mjs';

export const rules=new Map(registry.reviewedPaths.map(row=>[row[0],row]));
const escape=key=>key.replaceAll('~','~0').replaceAll('/','~1');
export const pattern=path=>path.replace(/\/\d+(?=\/|$)/g,'/*');
const authority=path=>rules.get(pattern(path))?.[1]??'UNRESOLVED_AUTHORITY';
export const auditDigest=value=>createHash('sha256').update(exactJson(value)).digest('hex');
export function enumerate(snapshot,algorithm='stack'){
 const result=new Map();
 if(algorithm==='recursive'){
  function visit(value,path){result.set(path,value);if(value!==null&&typeof value==='object')for(const key of Object.keys(value))visit(value[key],path+'/'+escape(key));}
  visit(snapshot,'/observationSnapshot');
 } else {
  const pending=[['/observationSnapshot',snapshot]];
  while(pending.length){const [path,value]=pending.pop();result.set(path,value);if(value!==null&&typeof value==='object')for(const key of Object.keys(value).reverse())pending.push([path+'/'+escape(key),value[key]]);}
 }
 return result;
}
const primitive=value=>value===null||typeof value!=='object';
export function semanticLeaves(snapshot){
 return [...enumerate(snapshot)].filter(([path,value])=>primitive(value)&&authority(path)!=='operationalRequestContext').sort(([a],[b])=>a.localeCompare(b));
}
export function buildInventory(rows,{algorithm='stack',knownPaths=[]}={}){
 const byState=new Map(),records=new Map();
 for(const row of rows){
  const semantic=semanticLeaves(row.snapshot),old=byState.get(row.id);
  if(old)assert.deepEqual(semantic,old.semantic,'Conflicting evidence for stable scenario ID '+row.id);
  else byState.set(row.id,{semantic,paths:new Set()});
  for(const [path,value] of enumerate(row.snapshot,algorithm)){
   let record=records.get(path);
   if(!record){record={path,authority:authority(path),shapes:new Set(),numericClasses:new Set(),strings:new Set(),orderedArrays:new Set(),states:new Set()};records.set(path,record);}
   record.states.add(row.id);byState.get(row.id).paths.add(path);
   record.shapes.add(value===null?'NULL':Array.isArray(value)?'ARRAY':typeof value==='object'?'OBJECT':typeof value==='number'?'NUMBER':typeof value==='string'?'STRING':'BOOLEAN');
   if(Array.isArray(value))record.shapes.add(value.length?'POPULATED_ARRAY':'EMPTY_ARRAY');
   // Operational cache state is still accounted for by exact path/type/presence.
   // Its hit/miss label and elapsed-time value are not scientific inventory content.
   if(record.authority!=='operationalRequestContext'){
    if(typeof value==='number')record.numericClasses.add(Object.is(value,-0)?'-0':value===0?'+0':'FINITE_NONZERO');
    if(typeof value==='string')record.strings.add(value);
    if(Array.isArray(value)&&value.every(primitive))record.orderedArrays.add(exactJson(value));
   }
  }
 }
 const states=[...byState.keys()].sort();
 for(const path of knownPaths)if(!records.has(path))records.set(path,{path,authority:authority(path),shapes:new Set(),numericClasses:new Set(),strings:new Set(),orderedArrays:new Set(),states:new Set()});
 return [...records.values()].map(r=>{
  const present=states.filter(id=>r.states.has(id)),absent=states.filter(id=>!r.states.has(id));
  return {path:r.path,pattern:pattern(r.path),authority:r.authority,shapes:[...r.shapes].sort(),numericClasses:[...r.numericClasses].sort(),strings:[...r.strings].sort(),orderedArrays:[...r.orderedArrays].sort(),
   presence:present.length===0?'NEVER_EMITTED':absent.length===0?'PRESENT_IN_ALL_RELEVANT_SCENARIOS':'ABSENT_IN_SPECIFIC_PRODUCER_STATE',presentStates:present,absentStates:absent,
   optionalityAuthority:absent.length&&present.length?'PRODUCER_BRANCH_REVIEW_REQUIRED':'NO_OPTIONALITY_INFERRED',
   valuePolicy:r.authority==='operationalRequestContext'?'OPERATIONAL_VALUE_EXCLUDED_FROM_SEMANTIC_DIGEST':'RETAINED',
   temporalRole:r.path.endsWith('/observedAt')?'PRODUCER_SOURCE_REVIEW_REQUIRED':null,
   referenceRole:r.path.endsWith('/observationReference')?'SHAPE_PLACEMENT_COMPARISON_ONLY_NOT_AUTHENTICATION':null};
 }).sort((a,b)=>a.path.localeCompare(b.path));
}

export function compareHistorical(inventory,historical){
 const previous=new Map(historical.inventory.map(x=>[x.path,x]));
 const current=new Map(inventory.map(x=>[x.path,x]));
 return [...new Set([...previous.keys(),...current.keys()])].sort().map(path=>{
  const a=previous.get(path),b=current.get(path);
  return {path,status:!a?'NEW_PRODUCER_PATH':!b?'HISTORICAL_ONLY_PATH':
   exactJson(a.strings??a.stringValues??[])===exactJson(b.strings)?'SAME_STRING_UNION':'CHANGED_STRING_UNION',
   oldShapes:a?.shapes??[],newShapes:b?.shapes??[],removedStrings:(a?.strings??a?.stringValues??[]).filter(v=>!b?.strings.includes(v)),addedStrings:(b?.strings??[]).filter(v=>!(a?.strings??a?.stringValues??[]).includes(v)),
   explanation:path==='/'?'Historical artificial wrapper':path.includes('/cache/')?'Operational values excluded; paths/shapes retained':'New explicitly keyed scenarios and source threshold/driver coverage; exact differences retained for review'};
 });
}
