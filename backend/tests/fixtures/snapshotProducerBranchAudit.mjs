// Source-bound producer branch catalogue. Tests exercise outcomes; no projection implementation.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
export const sourceSha256=createHash('sha256').update(source).digest('hex');
const between=(a,b)=>{const start=source.indexOf(a),end=source.indexOf(b,start+a.length);if(start<0||end<start)throw Error('Producer source boundary not found');return source.slice(start,end);};
const confidenceSource=between('export function assessSstTransitionConfidence(','async function getCachedSeaSurfaceTemperaturePoint(');
const featureSource=between('export function buildGovernedEnvironmentalFeatureObservationV1(','export const GOVERNED_FEATURE_POSITION_TYPES');
export const confidenceReasonSourceVocabulary=[...new Set([...confidenceSource.matchAll(/reasons\.push\(\s*"([^"]+)"/g)].map(x=>x[1]))];
export const requirementSourceVocabulary=[...new Set([...featureSource.matchAll(/missingRequirements\.push\(\s*"([^"]+)"/g)].map(x=>x[1]))];
export const reasonStages=[
 {condition:'sufficientCoverage && coverageRatio === 1; else ratio >= .75; else',values:['complete-four-point-coverage','partial-but-sufficient-coverage','insufficient-spatial-coverage']},
 {condition:'finite range: >=2, >=1, >=.5, else; omit if nonfinite',values:['strong-total-temperature-range','moderate-total-temperature-range','weak-total-temperature-range','minimal-total-temperature-range'],optional:true},
 {condition:'clear orientation: magnitude >=2, >=1, >=.3; else no clear',values:['strong-directional-difference','moderate-directional-difference','weak-directional-difference','no-clear-directional-orientation']},
 {condition:'finite axis separation: >=1, >=.5, >=.2, else; nonfinite => single-axis',values:['clear-dominant-axis','moderately-distinct-axis','weak-axis-separation','competing-directional-signals','single-axis-only']},
 {condition:'age finite: <=3, <=12, <=24, else; null => unavailable; negative age rejected upstream',values:['recent-samples','same-day-samples','samples-within-24-hours','stale-samples','sample-time-unavailable']}
];
export function branchMatrix(rows){
 const cold=rows.filter(x=>x.cacheRun==='cold'),branches=[];
 function add(id,fn,condition,paths,predicate,unreachableReason=null){
  const scenarios=predicate?cold.filter(predicate).map(x=>x.name):[];
  branches.push({id,sourceFile:'backend/server.js',producer:fn,condition,paths,reachable:unreachableReason===null,unreachableReason,scenarios,status:unreachableReason?'UNREACHABLE_IN_REVIEWED_DOMAIN':scenarios.length?'EXERCISED':'UNCOVERED'});
 }
 const spatial='/observationSnapshot/observations/sst/derived/spatialStructure';
 for(const reason of confidenceReasonSourceVocabulary)add('confidence:'+reason,'assessSstTransitionConfidence',reason==='future-dated-sample-time'?'ageHours < 0 after future-time guard':reasonStages.find(x=>x.values.includes(reason))?.condition,[spatial+'/confidence/reasons/*'],c=>c.spatial.confidence.reasons.includes(reason),reason==='future-dated-sample-time'?'Finite future times throw before age computation; nonfinite times produce null, not negative age.':null);
 for(const value of [null,'uniform-water','weak-temperature-transition','moderate-temperature-transition','strong-temperature-break-candidate'])add('range:'+String(value),'classifySstSpatialRange','nonfinite; <.5; <1; <2; else',[spatial+'/classification',spatial+'/minimumFahrenheit',spatial+'/maximumFahrenheit',spatial+'/rangeFahrenheit'],c=>c.spatial.classification===value);
 for(const value of [null,'cool','mild','warm','very-warm','hot'])add('band:'+String(value),'classifySeaSurfaceTemperature','nonfinite; <68; <75; <80; <85; else',['/observationSnapshot/observations/sst/derived/temperatureBand'],c=>c.sst.derived.temperatureBand===value);
 for(const field of ['eastWestDifferenceFahrenheit','northSouthDifferenceFahrenheit','dominantDifferenceFahrenheit'])for(const absent of [false,true])add('orientation:'+field+':'+absent,'deriveSstTransitionOrientation','opposite finite samples; dominant signal >=.3',[spatial+'/orientation/'+field],c=>(c.spatial.orientation[field]===null)===absent);
 for(const side of ['north','east','south','west',null])add('orientation:warmSide:'+side,'deriveSstTransitionOrientation','magnitude/sign chooses warm/cool side; no signal nulls sides',[spatial+'/orientation/warmSide',spatial+'/orientation/coolSide'],c=>c.spatial.orientation.warmSide===side);
 for(const field of ['dominantDirectionalDifferenceFahrenheit','secondaryDirectionalDifferenceFahrenheit','axisSeparationFahrenheit','sampleAgeHours'])for(const absent of [false,true])add('confidence:'+field+':'+absent,'assessSstTransitionConfidence','pair count / finite retained sample time',[spatial+'/confidence/'+field],c=>(c.spatial.confidence[field]===null)===absent);
 const feature='/observationSnapshot/observations/sst/derived/governedEnvironmentalFeatureObservation';
 const reachableRequirements=new Set(['sufficient-spatial-coverage','supported-temperature-transition-classification','at-least-three-valid-spatial-samples','consistent-spatial-sample-observation-time']);
 for(const value of requirementSourceVocabulary)add('requirement:'+value,'buildGovernedEnvironmentalFeatureObservationV1','ordered prerequisite check emitting '+value,[feature+'/missingRequirements/*'],c=>c.feature.missingRequirements.includes(value),reachableRequirements.has(value)?null:'Current caller supplies fixed valid feature/type/family/source contracts, radius15 and unique cardinal directions; corrupt API arguments are outside producer-valid domain.');
 for(const available of [true,false])add('feature:available:'+available,'buildGovernedEnvironmentalFeatureObservationV1','missingRequirements.length === 0',[feature+'/available',feature+'/observationReference'],c=>c.feature.available===available);
 for(const count of [0,1,2])add('feature:time-cardinality:'+count,'buildGovernedEnvironmentalFeatureObservationV1','one distinct retained normalized time => populated, else null',[feature+'/observedAt'],c=>Math.min(2,new Set(c.feature.samplingFootprint.samples.map(x=>x.observedAt)).size)===count);
 for(const count of [0,1,2,3,4])add('feature:sample-count:'+count,'buildGovernedEnvironmentalFeatureObservationV1','filter finite valid source samples with parseable time; sort cardinal order',[feature+'/samplingFootprint/samples'],c=>c.feature.samplingFootprint.sampleCount===count);
 for(const state of ['unavailable','temperature-only','uniform-water','weak-temperature-structure','moderate-temperature-structure','strong-temperature-break-candidate'])add('temperature-evidence:'+state,'buildTemperatureEvidence','availability then ordered spatial-classification branches',['/observationSnapshot/evidence/groups/temperature'],c=>c.snapshot.evidence.groups.temperature.classification===state);
 for(const status of ['available','unavailable','request-failed'])add('sample-source:'+status,'getSeaSurfaceTemperaturePoint / getSstSpatialStructureAtAssessment','finite sample; normalized missing; settled rejection',[spatial+'/samples/*/source/availability'],c=>c.spatial.samples.some(x=>x.source.availability===status));
 add('snapshot:valid','buildObservationSnapshot','finite location and assembled oceanEvidence object',['/observationSnapshot'],c=>c.snapshot.available===true);
 add('snapshot:invalid-wrapper','buildObservationSnapshot','invalid location/evidence or missing contracts',['/observationSnapshot'],null,'Current caller always supplies finite location and actual unchanged assemblers; malformed wrapper injection is not a valid producer scenario.');
 add('snapshot:clone','cloneSnapshotValue','structuredClone of non-null JSON-compatible governed subtree',['/observationSnapshot/observations'],c=>c.snapshot.observations.sst.derived.spatialStructure!==c.spatial);
 add('snapshot:clone-fallback','cloneSnapshotValue','structuredClone unavailable/throws',['/observationSnapshot/observations'],null,'Supported Node has structuredClone; parser outputs are data-only cloneable objects.');
 add('sampling:polar-empty','createSstSpatialSamplePoints','abs(cos(latitude)) <= .01',[spatial+'/samples'],null,'Reviewed fixed nonpolar candidate locations; no geographic-domain expansion in this task.');

 for(const level of ['low','moderate','high'])add('confidence:level:'+level,'assessSstTransitionConfidence','bounded score >=75 / >=45 / else, then coverage/orientation caps',[spatial+'/confidence/level'],c=>c.spatial.confidence.level===level);
 for(const absent of [false,true])add('sample:observedAt:'+absent,'getSeaSurfaceTemperaturePoint','payload.current.time ?? null',[spatial+'/samples/*/observedAt'],c=>c.spatial.samples.some(x=>(x.observedAt===null)===absent));
 for(const [i,direction] of ['north','east','south','west'].entries())add('sample:rejected:'+direction,'getSstSpatialStructureAtAssessment','Promise.allSettled rejection inserts null resolved coordinates/time/temperatures and request-failed source',[spatial+'/samples/'+i],c=>c.spatial.samples[i].source.availability==='request-failed');
 add('cache:miss','getCachedSeaSurfaceTemperaturePoint','no cached finite value / expired entry',[spatial+'/samples/*/cache'],c=>c.spatial.samples.some(x=>x.cache.status==='miss'));
 add('cache:hit','getCachedSeaSurfaceTemperaturePoint','cached finite value within TTL',[spatial+'/samples/*/cache'],c=>rows.some(x=>x.name===c.name&&x.cacheRun==='warm'&&x.spatial.samples.some(s=>s.cache.status==='hit')));
 add('cache:inflight-join','getCachedSeaSurfaceTemperaturePoint','same coordinate request concurrently in flight',[spatial+'/samples'],null,'Distinct cardinal coordinates, sequential scenario calls; no duplicate concurrent point requests in this harness domain.');
 return {version:'pelora-snapshot-producer-branch-audit-v1',sourceSha256,scope:'Reviewed SST parser/spatial/feature/temperature-evidence/snapshot authority branches; non-SST auxiliary producer inputs fixed',branches,confidenceReasonSourceVocabulary,reasonStages,requirementSourceVocabulary};
}
