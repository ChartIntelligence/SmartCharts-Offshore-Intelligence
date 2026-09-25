// Controlled comparison surface; never invokes the request route, Auth, or species science.
import {parsed,inputs,currentSupport} from './marineAssessorCompanionFixture.mjs';
import {readFileSync} from 'node:fs';
import {captureMarineAssessorCompanionV1,replayMarineAssessorCompanionV1} from '../../marineAssessorCompanionCapture.mjs';
import {assessOceanConditions,assessOceanEvidence,assessOceanOpportunity,buildOceanPersistence,
  buildObservationSnapshot,buildIntelligenceSnapshot,buildSnapshotMetadata,buildOceanSnapshot,
  resolveOceanSignals,buildRelationshipContext,assessRelationships,buildTemperatureTransitionMapFeature,
  getMoonConditions,buildUnifiedOpportunityCandidateSourceUniverseV1,resolveOpportunityCandidateBathymetryV1,
  getSstSpatialStructure,getCurrentSpatialStructure,getCurrentConditionsPoint,getChlorophyllConditions,
  buildCurrentVectorProjectionAnalysis,buildCurrentGradientAnalysis,buildCurrentShearAnalysis,
  buildCurrentConvergenceAnalysis,buildCurrentEdgeAnalysis,buildGovernedEnvironmentalFeatureObservationV1} from '../../server.js';

export const recordedAt='2026-09-24T02:00:00Z';
export function histories(){return [-8,-4,0].map((h,i)=>({snapshot:{available:true,identity:{snapshotId:'synthetic-history-'+i},
  metadata:{time:{observedAt:new Date(Date.parse(recordedAt)+h*3600000).toISOString()}},
  observation:{observations:{sst:{temperatureFahrenheit:84},currents:{speedKnots:1,directionDegrees:90}}}}}));}
export async function sources(t,opts={}){
  const original=await parsed(t,opts),{q,input}=inputs(original),support=currentSupport(original);
  const companion=captureMarineAssessorCompanionV1(input,q);
  // Same synthetic point-source attribution used by the locked fixture, on both paths.
  // This attribution is not a live provider qualification claim.
  const attributed={...original,sst:{...original.sst,source:{provider:'Open-Meteo',classification:'forecast-model',
    availability:Number.isFinite(original.sst.temperatureFahrenheit)?'available':'unavailable'}}};
  return {original:attributed,replayed:{...replayMarineAssessorCompanionV1(companion,q),sst:support.replaySst},support};
}
export function composite(m,support,{retrieval=recordedAt,history=[],captain={origin:{latitude:24,longitude:-89},range:50},species=null,ocean=null}={}){
  const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
  const rawCandidate=buildUnifiedOpportunityCandidateSourceUniverseV1().candidates[0];
  const candidateContext={id:rawCandidate.id,coordinates:rawCandidate.coordinates,
    bathymetry:resolveOpportunityCandidateBathymetryV1(rawCandidate)};
  const dataQuality=support.quality(m);
  // Deliberately limited missing point fixtures, as in the preceding diagnostic.
  // This task qualifies semantic separation, not full spatial reconstruction.
  const chlorophyll=ocean?.chlorophyll??{concentrationMgM3:null},currents=ocean?.currents??{speedKnots:null,directionDegrees:null};
  if(ocean)m={...m,sst:ocean.sst};
  const oceanEvidence=assessOceanEvidence({latitude:m.location.latitude,longitude:m.location.longitude,sst:m.sst,chlorophyll,currents,dataQuality});
  const oceanOpportunity=assessOceanOpportunity({oceanEvidence,oceanPersistence:buildOceanPersistence({historicalSnapshots:history})});
  const relationshipContext=buildRelationshipContext({oceanOpportunity,oceanEvidence});
  const relationshipAssessment=assessRelationships({relationshipContext,oceanOpportunity,oceanEvidence,dataQuality});
  const observationSnapshot=buildObservationSnapshot({location:m.location,observedAt:m.observedAt,generatedAt:retrieval,
    observations:{wind:m.wind,waves:m.waves,swell:m.swell,sst:m.sst,chlorophyll,currents},oceanEvidence,dataQuality});
  const intelligenceSnapshot=buildIntelligenceSnapshot({observedAt:m.observedAt,generatedAt:retrieval,oceanOpportunity,relationshipContext,relationshipAssessment,
    oceanPhysicsExplainability:oceanEvidence.oceanPhysicsExplainability,oceanOrganization:oceanEvidence.oceanOrganization});
  const snapshotMetadata=buildSnapshotMetadata({observationSnapshot,intelligenceSnapshot});
  return {location:m.location,observedAt:m.observedAt,lastUpdated:retrieval,dataQuality,
    oceanConditions:assessOceanConditions({...m,dataQuality}),oceanEvidence,
    mapIntelligence:{temperatureTransition:buildTemperatureTransitionMapFeature({latitude:m.location.latitude,longitude:m.location.longitude,
      temperatureEvidence:oceanEvidence.groups.temperature,spatialStructure:m.sst.derived?.spatialStructure})},
    observationSnapshot,intelligenceSnapshot,snapshotMetadata,
    oceanSnapshot:buildOceanSnapshot({snapshotMetadata,observationSnapshot,intelligenceSnapshot}),
    oceanOpportunity,oceanSignals:resolveOceanSignals({oceanOpportunity}),relationshipContext,relationshipAssessment,
    blueMarlinHabitat:species,wind:m.wind,waves:m.waves,swell:m.swell,sst:m.sst,chlorophyll,currents,
    moon:getMoonConditions(assessment.assessmentAt),assessment,candidateContext,
    status:null,source:{marine:m.source,moon:getMoonConditions(assessment.assessmentAt).source,
      ...(chlorophyll.source?{chlorophyll:chlorophyll.source}:{}),...(currents.source?{currents:currents.source}:{})},
    diagnostics:{synthetic:true},captainContext:captain};
}

// Schema-audit corpus only: actual synthetic parsers and unchanged spatial assemblers.
// These frozen auxiliary objects do NOT establish capture-derived spatial replay.
const source=readFileSync(new URL('../../server.js',import.meta.url),'utf8');
function existing(name,next){
  const start=source.indexOf('function '+name+'('),end=source.indexOf(next,start+1);
  if(start<0||end<=start)throw Error('Existing assembler extraction failed');
  return new Function(source.slice(start,end)+'\nreturn '+name+';')();
}
const organization=existing('buildCurrentOrganizationAnalysis','function buildCurrentRelationshipContext(');
const relationship=existing('buildCurrentRelationshipContext','function getCurrentProjectionAxes(');
const pattern=existing('buildCurrentSpatialPatternAnalysis','async function getCurrentConditions(');
const temperatureBand=existing('classifySeaSurfaceTemperature','function currentDirectionDegrees(');
const sstStart=source.indexOf('    const sst = {',source.indexOf('async function getOceanConditionsAtAssessment('));
const sstEnd=source.indexOf('const oceanEvidence =',sstStart);
if(sstStart<0||sstEnd<=sstStart)throw Error('Current SST assembly unavailable');
const currentSst=new Function('marine','sstSpatial','governedEnvironmentalFeatureObservation','classifySeaSurfaceTemperature',
  source.slice(sstStart,sstEnd)+'\nreturn sst;');
export async function spatialCorpus(t){
  const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00Z'};
  let n=0;
  const fetch=t.mock.method(globalThis,'fetch',async url=>({ok:true,json:async()=>String(url).includes('open-meteo')
    ? {latitude:25,longitude:-90,current:{time:'2026-09-24T00:00:00Z',sea_surface_temperature:25+(n++%4)}}
    : {table:{columnNames:['time','latitude','longitude','chlor_a','u_current','v_current'],rows:[['2026-09-24T00:00:00Z',25,-90,0.1,0.5+(n++%4)/10,0.2]]}}}));
  try{
    const spatialStructure=await getCurrentSpatialStructure(25,-90,assessment);
    const currents=await getCurrentConditionsPoint(25,-90,assessment);
    const chlorophyll=await getChlorophyllConditions(25,-90,assessment);
    const spatial=await getSstSpatialStructure(25,-90,78.8,assessment);
    const org=organization(spatialStructure),rel=relationship(org),pat=pattern(spatialStructure,rel),vp=buildCurrentVectorProjectionAnalysis(spatialStructure);
    const gradient=buildCurrentGradientAnalysis(vp),shear=buildCurrentShearAnalysis(gradient),convergence=buildCurrentConvergenceAnalysis(vp);
    currents.derived={...currents.derived,spatialAnalysis:{available:spatialStructure.available===true,spatialStructure,organization:org,
      relationshipContext:rel,spatialPattern:pat,vectorProjection:vp,gradient,convergence,
      edge:buildCurrentEdgeAnalysis(gradient,shear,pat,convergence),shear,eddyBoundary:null,contractVersion:'pelora-current-spatial-analysis-v1'}};
    return {sst:currentSst({sst:{requestedLatitude:25,requestedLongitude:-90,resolvedLatitude:25,resolvedLongitude:-90,
      observedAt:'2026-09-24T00:00:00Z',timestampProvenance:'marine-current-block-valid-time',temperatureCelsius:26,temperatureFahrenheit:78.8}},
      spatial,buildGovernedEnvironmentalFeatureObservationV1({spatialStructure:spatial}),temperatureBand),chlorophyll,currents};
  }finally{fetch.mock.restore();}
}

// Explicit external wrapper shapes used only to attack isolation. These are not
// newly accepted provider fields or a species evaluator/schema implementation.
export const captainReviewFixture=()=>({origin:{latitude:22,longitude:-87},range:200,
  userId:'synthetic-user',user_id:'synthetic-user',captainId:'synthetic-captain',captain_id:'synthetic-captain',
  email:'synthetic@example.invalid',auth:{session:'synthetic-session',token:'synthetic-token'},
  session:'synthetic-session',boat:'synthetic-boat',mission:'synthetic-mission',
  fishingLog:[],catch:[],lure:'synthetic-lure',bait:'synthetic-bait',wrapperState:'synthetic'});
export const speciesReviewFixture=()=>({species:'synthetic-output-only',score:1,confidence:0.2,eligible:false,
  habitat:'synthetic',eligibility:false,gate:{passed:false},rankingPermission:false,rank:2,
  narrative:'synthetic downstream narrative',opportunity:{id:'synthetic-opportunity',status:'excluded'}});

export async function semanticReviewCorpus(t){
  const result=[];
  for(const opts of [{},{weatherFail:true},{marineFail:true},{weather:{wind_speed_10m:undefined}},
    {weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}},
    {weather:{wind_speed_10m:0,wind_gusts_10m:0,wind_direction_10m:0}},
    {marine:{wave_direction:270,wave_period:3}}]){
    const b=await sources(t,opts);
    for(const m of [b.original,b.replayed])for(const history of [[],histories()])result.push(composite(m,b.support,{history}));
  }
  const b=await sources(t),ocean=await spatialCorpus(t);
  result.push(composite(b.original,b.support,{ocean}));
  result.push(composite(b.original,b.support,{captain:captainReviewFixture(),species:speciesReviewFixture()}));
  return result;
}
