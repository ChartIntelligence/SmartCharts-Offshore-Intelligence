// Source/range audit; no failed catalogue or projection-v3 dependency.
import {Session} from 'node:inspector';
import {createHash} from 'node:crypto';
import {source} from './snapshotProducerQualificationV2Fixture.mjs';
const hash=text=>createHash('sha256').update(text).digest('hex');
export const sourceHash=hash(source);
const names=[
 'getSeaSurfaceTemperaturePoint','getCachedSeaSurfaceTemperaturePoint','getCachedSstPoint','setCachedSstPoint',
 'createSstSpatialSamplePoints','classifySstSpatialRange','deriveSstTransitionOrientation','assessSstTransitionConfidence',
 'getSstSpatialStructureAtAssessment','buildGovernedEnvironmentalFeatureObservationV1','buildTemperatureEvidence',
 'assessOceanEvidence','buildSurfaceWaterCharacterAnalysis','buildWaterMassAnalysis','buildMixingZoneAnalysis',
 'buildEnvironmentalTransitionAnalysis','buildOceanFrontAnalysis','buildOceanPhysicsExplainabilitySummary',
 'buildOceanPhysicsExplainabilityLineage','buildOceanOrganizationAnalysis','buildObservationSnapshot','cloneSnapshotValue'
];
const declarations=[...source.matchAll(/^(?:export )?(?:async )?function\s+(\w+)\s*\(/gm)];
export const functions=declarations.filter(m=>names.includes(m[1])).map(m=>{
 const next=declarations.find(n=>n.index>m.index);
 const text=source.slice(m.index,next?.index??source.length);
 return {name:m[1],start:m.index,end:next?.index??source.length,line:source.slice(0,m.index).split('\n').length,sha256:hash(text),text};
});
export function functionSource(name){const f=functions.find(f=>f.name===name);if(!f)throw Error('Missing source function '+name);return f.text;}
export function sourcePredicates(){
 const predicates=[];
 for(const f of functions)for(const match of f.text.matchAll(/\bif\s*\(/g)){
  const open=f.start+match.index+match[0].lastIndexOf('(');let depth=1,end=open+1,quote=null;
  for(;end<source.length&&depth;end++){
   const ch=source[end];
   if(quote){if(ch==='\\')end++;else if(ch===quote)quote=null;continue;}
   if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
   if(ch==='(')depth++;if(ch===')')depth--;
  }
  if(depth)throw Error('Unclosed source predicate');
  predicates.push({id:f.name+':if:'+open,producer:f.name,sourceFile:'backend/server.js',line:source.slice(0,open).split('\n').length,predicate:source.slice(open+1,end-1).trim(),status:'PREDICATE_INVENTORIED_NOT_A_REACHABILITY_PROOF'});
 }
 return predicates;
}
// Exact source literals are subordinate to their actual source predicates, not an expected output oracle.
export const sourceVocabularies={
 confidence:[...new Set([...functionSource('assessSstTransitionConfidence').matchAll(/reasons\.push\(\s*"([^"]+)"/g)].map(m=>m[1]))],
 requirements:[...new Set([...functionSource('buildGovernedEnvironmentalFeatureObservationV1').matchAll(/missingRequirements\.push\(\s*"([^"]+)"/g)].map(m=>m[1]))],
 temperatureDrivers:{literal:[...functionSource('buildTemperatureEvidence').matchAll(/drivers\.push\(\s*"([^"]+)"/g)].map(m=>m[1]),dynamic:['spatialClassification','`spatial-pattern-confidence-${confidence.level}`']}
};

export async function startSourceCoverage(){
 const session=new Session();session.connect();
 const post=(method,params={})=>new Promise((resolve,reject)=>session.post(method,params,(error,value)=>error?reject(error):resolve(value)));
 await post('Profiler.enable');await post('Profiler.startPreciseCoverage',{callCount:true,detailed:true});
 const cases=[];
 return {
  async discardSetup(){await post('Profiler.takePreciseCoverage');},
  async collect(id){
   const result=await post('Profiler.takePreciseCoverage');
   const script=result.result.find(x=>x.url.replaceAll('\\','/').endsWith('/backend/server.js'));
   if(!script)throw Error('Actual producer coverage missing');
   cases.push({id,functions:script.functions});
  },
  async stop(){await post('Profiler.stopPreciseCoverage');session.disconnect();return cases;}
 };
}

export function coverageMatrix(cases){
 const ranges=new Map();
 for(const c of cases)for(const fn of c.functions){
  const owner=functions.find(f=>fn.ranges[0].startOffset>=f.start&&fn.ranges[0].startOffset<f.end);
  if(!owner)continue;
  for(const range of fn.ranges){
   const id=owner.name+':'+range.startOffset+':'+range.endOffset;
   let entry=ranges.get(id);
   if(!entry){entry={id,producer:owner.name,sourceFile:'backend/server.js',functionStart:fn.ranges[0].startOffset,functionEnd:fn.ranges[0].endOffset,start:range.startOffset,end:range.endOffset,line:source.slice(0,range.startOffset).split('\n').length,
    source:source.slice(range.startOffset,range.endOffset),precedingSource:source.slice(Math.max(owner.start,range.startOffset-220),range.startOffset),scenarios:new Set(),kind:range===fn.ranges[0]?'FUNCTION_RANGE':'BLOCK_RANGE'};ranges.set(id,entry);}
  }
 }
 // V8 reports nested ranges only when their count differs from the enclosing range.
 // An omitted child is not an uncovered child: inherit the narrowest enclosing count.
 for(const entry of ranges.values())for(const c of cases){
  const fn=c.functions.find(f=>f.ranges[0].startOffset===entry.functionStart&&f.ranges[0].endOffset===entry.functionEnd);
  if(!fn)continue;
  const containing=fn.ranges.filter(r=>r.startOffset<=entry.start&&r.endOffset>=entry.end).sort((a,b)=>(a.endOffset-a.startOffset)-(b.endOffset-b.startOffset));
  if(containing[0]?.count>0)entry.scenarios.add(c.id);
 }
 return [...ranges.values()].map(r=>({...r,scenarios:[...r.scenarios].sort(),status:r.scenarios.size?'EXECUTED':'REQUIRES_SOURCE_REACHABILITY_REVIEW'})).sort((a,b)=>a.start-b.start||a.end-b.end);
}

export function thresholdEvidence(rows){
 const tests=[
  {field:'rangeFahrenheit',thresholds:[0.5,1,2],get:r=>r.spatial.rangeFahrenheit},
  {field:'orientation signal input (retained confidence dominant difference)',thresholds:[0.3,1,2],get:r=>r.spatial.confidence.dominantDirectionalDifferenceFahrenheit},
  {field:'confidence.axisSeparationFahrenheit',thresholds:[0.2,0.5,1],get:r=>r.spatial.confidence.axisSeparationFahrenheit},
  {field:'confidence.score',thresholds:[45,75],get:r=>r.spatial.confidence.score},
  {field:'confidence.sampleAgeHours',thresholds:[3,12,24],get:r=>r.spatial.confidence.sampleAgeHours},
  {field:'validNeighborCount',thresholds:[3],get:r=>r.spatial.validNeighborCount}
 ];
 return tests.flatMap(t=>t.thresholds.map(threshold=>{
  const samples=rows.filter(r=>Number.isFinite(t.get(r)));
  const below=Math.max(...samples.map(t.get).filter(n=>n<threshold));
  const above=Math.min(...samples.map(t.get).filter(n=>n>threshold));
  const at=samples.filter(r=>t.get(r)===threshold).map(r=>r.id);
  const impossible=t.field==='confidence.score'&&threshold===45&&!possibleCoherentScores().includes(45);
  return {field:t.field,threshold,below:Number.isFinite(below)?below:null,above:Number.isFinite(above)?above:null,exactScenarios:[...new Set(at)].sort(),status:impossible?'EXACT_UNREACHABLE_DISCRETE_SCORE_BRACKETED':at.length&&Number.isFinite(below)&&Number.isFinite(above)?'EXACT_AND_BRACKETED':'BOUNDARY_NOT_YET_COVERED'};
 }));
}

// Audit proof over an over-approximation of the existing score branches, not a producer.
// Total range is >= every opposite-pair magnitude. With <=3 finite neighbors there
// cannot be two opposite pairs, so the axis contribution is zero. A no-clear
// magnitude (<.3 F) cannot have axis separation >=.5 F. These are constraints on
// source branches; this helper never computes evidence or supplies producer input.
export function possibleCoherentScores(){
 const values=new Set();
 const directionByRange={0:[0,8],8:[0,8],18:[0,8,18],25:[0,8,18,25]};
 for(const count of [0,1,2,3,4])for(const range of count<3?[0]:[0,8,18,25])
 for(const direction of count<3?[0,8,18,25]:directionByRange[range])
 for(const axis of count<4?[0]:direction===0?[0,5]:[0,5,10,15])
 for(const time of [0,3,6,10])values.add((count===4?25:count===3?15:0)+range+direction+axis+time);
 return [...values].sort((a,b)=>a-b);
}

export function prerequisiteAudit(rows){
 const excluded={
  'supported-feature-type':'Caller omits override; producer default is temperature-transition.',
  'supported-feature-family':'Caller omits override; producer default physical-ocean belongs to the production family list.',
  'supported-observation-type':'Caller omits override; producer default is temperature-transition-observation.',
  'governed-spatial-structure':'Caller supplies the object returned by getSstSpatialStructure, never an injected wrapper.',
  'supported-source-type':'Caller omits override; producer default is spatial-temperature-analysis.',
  'recognized-spatial-temperature-contract':'Caller omits override; unchanged spatial producer writes pelora-sst-spatial-range-v1.',
  'valid-sampling-radius':'Unchanged spatial producer writes the constant positive radius 15.',
  'unique-spatial-sample-directions':'Unchanged sampler creates each cardinal role once; settled results retain role and filtering cannot create duplicates.'
 };
 const f=functions.find(f=>f.name==='buildGovernedEnvironmentalFeatureObservationV1');
 const predicates=sourcePredicates().filter(p=>p.producer===f.name);
 return sourceVocabularies.requirements.map(value=>{
  const offset=f.start+f.text.indexOf('"'+value+'"');
  const prior=predicates.filter(p=>Number(p.id.split(':').at(-1))<offset).at(-1);
  const cases=[...new Set(rows.filter(r=>r.feature.missingRequirements.includes(value)).map(r=>r.id))].sort();
  return {value,predicate:prior?.predicate??null,sourceLine:prior?.line??null,scenarios:cases,status:excluded[value]?'EXCLUDED_BY_FIXED_CALLER_CONTRACT':cases.length?'EXERCISED':'UNCOVERED',exclusionProof:excluded[value]??null};
 });
}

export function vocabularyAudit(rows){
 return {
  confidence:{sourceLiterals:sourceVocabularies.confidence,emitted:[...new Set(rows.flatMap(r=>r.spatial.confidence.reasons))].sort(),orderedStages:[
   {predicate:'sufficientCoverage && coverageRatio === 1; else coverageRatio >= .75; else',omission:false},
   {predicate:'Number.isFinite(rangeFahrenheit); thresholds >=2, >=1, >=.5, else',omission:true},
   {predicate:'orientation.classification === directional-temperature-transition && finite dominantMagnitude; thresholds >=2, >=1, >=.3; else no-clear',omission:false},
   {predicate:'finite axisSeparationFahrenheit; thresholds >=1, >=.5, >=.2, else; nonfinite single-axis',omission:false},
   {predicate:'finite ageHours; <=3, <=12, <=24, else; nonfinite unavailable; negative age is precluded by future guard',omission:false}
  ],excludedLiteral:{value:'future-dated-sample-time',proof:'Finite newestObservationTime after assessment throws before ageHours is calculated.'}},
  drivers:{emitted:[...new Set(rows.flatMap(r=>r.snapshot.evidence.groups.temperature.drivers))].sort(),stages:[
   {predicate:'centerAvailable',value:'center-temperature-available'},
   {predicate:'spatialAvailable',value:'spatialClassification from unchanged classifier'},
   {predicate:'orientation.classification === directional-temperature-transition',value:'directional-temperature-transition'},
   {predicate:'confidence.level is populated',value:'spatial-pattern-confidence-${confidence.level}'},
   {predicate:'available AND no recognized spatial classification AND coverage !== sufficient',value:'insufficient-spatial-coverage'}
  ],boundary:'Stage order is source-governed; actual numerical correctness remains producer authority.'},
  requirements:prerequisiteAudit(rows),
  reference:'Available iff missingRequirements is empty; only then producer constructs observationReference. No reference authenticity claim.',
  featureTime:'One unique normalized retained sample time => observedAt; zero/multiple retained times => null, independently of availability.'
 };
}

export function reviewedCoverage(matrix,rows){
 const excluded=prerequisiteAudit(rows).filter(x=>x.exclusionProof);
 return matrix.map(entry=>{
  if(entry.status==='EXECUTED')return entry;
  let proof=null;
  if(entry.producer==='buildGovernedEnvironmentalFeatureObservationV1'&&entry.kind==='BLOCK_RANGE')proof=excluded.find(x=>entry.source.includes('"'+x.value+'"'))?.exclusionProof??null;
  if(entry.producer==='createSstSpatialSamplePoints')proof='All explicit centers are 25,-91; cos(25 degrees) exceeds .01. Polar geography is outside this domain.';
  if(entry.producer==='assessSstTransitionConfidence'){
   if(entry.source.trim()===': 0')proof='expectedSampleCount is the source constant 4; the zero-denominator fallback cannot execute.';
   if(entry.source.includes('future-dated-sample-time'))proof='Finite future samples throw before age calculation; valid past/null sample times cannot produce negative age.';
   if(entry.source.includes('throw new TypeError'))proof='Reviewed producer-output domain requires past/null observation time. Future-time rejection is tested separately and produces no snapshot.';
  }
  return proof?{...entry,status:'EXCLUDED_WITH_SOURCE_PROOF',exclusionProof:proof}:entry;
 });
}

export function authorityFreezeGate(matrix){
 const blockers=matrix.filter(x=>x.status==='REQUIRES_SOURCE_REACHABILITY_REVIEW');
 return {verdict:blockers.length?'SNAPSHOT_PRODUCER_BRANCH_AUTHORITY_UNRESOLVED':'BRANCH_REVIEW_COMPLETE_AUTHORITY_REVIEW_STILL_REQUIRED',freezeAllowed:false,
  reason:blockers.length?'Unexecuted source ranges still lack predicate-by-predicate exclusion proofs. Absence in a fixture is not proof of unreachability.':'Semantic authority and optionality review must independently finish before any freeze.',
  blockingRangeIds:blockers.map(x=>x.id)};
}
