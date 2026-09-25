// Complete-object scope diagnostic. No candidate assembler, history resolver or species evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parsed,inputs,currentSupport} from './fixtures/marineAssessorCompanionFixture.mjs';
import {captureMarineAssessorCompanionV1,replayMarineAssessorCompanionV1} from '../marineAssessorCompanionCapture.mjs';
import {captureCurrentEvidenceV1} from '../currentEvidenceCapture.mjs';
import {captureFixture} from './fixtures/currentEvidenceCaptureFixture.mjs';
import {assessOceanConditions,assessOceanEvidence,assessOceanOpportunity,buildOceanPersistence,
  buildObservationSnapshot,buildIntelligenceSnapshot,buildSnapshotMetadata,buildOceanSnapshot,
  resolveOceanSignals} from '../server.js';

const time='2026-09-24T00:00:00Z';
function histories(){return [-8,-4,0].map((h,i)=>({snapshot:{available:true,identity:{snapshotId:'synthetic-history-'+i},
  metadata:{time:{observedAt:new Date(Date.parse(time)+h*3600000).toISOString()}},
  observation:{observations:{sst:{temperatureFahrenheit:84},currents:{speedKnots:1,directionDegrees:90}}}}}));}
function bundle(m){
  const {q,input}=inputs(m),companion=captureMarineAssessorCompanionV1(input,q),support=currentSupport(m);
  const replay={...replayMarineAssessorCompanionV1(companion,q),sst:support.replaySst};
  const dataQuality=support.quality(replay);
  assert.deepEqual(dataQuality,support.quality(m));
  assert.deepEqual(assessOceanConditions({...replay,dataQuality}),assessOceanConditions({...m,dataQuality}));
  const evidence=assessOceanEvidence({latitude:m.location.latitude,longitude:m.location.longitude,sst:replay.sst,
    chlorophyll:{concentrationMgM3:null},currents:{speedKnots:null,directionDegrees:null},dataQuality});
  return {captures:{quality:q,companion,sst:support.sst,chlorophyll:captureCurrentEvidenceV1(captureFixture('CHLOROPHYLL_DIRECT')),
    currents:captureCurrentEvidenceV1(captureFixture('CURRENTS'))},replay,dataQuality,evidence};
}
function snapshots(b,generatedAt,persistence){
  const oceanOpportunity=assessOceanOpportunity({oceanEvidence:b.evidence,oceanPersistence:persistence});
  const observationSnapshot=buildObservationSnapshot({location:b.replay.location,observedAt:b.replay.observedAt,generatedAt,
    observations:{wind:b.replay.wind,waves:b.replay.waves,swell:b.replay.swell,sst:b.replay.sst},oceanEvidence:b.evidence,dataQuality:b.dataQuality});
  const intelligenceSnapshot=buildIntelligenceSnapshot({observedAt:b.replay.observedAt,generatedAt,oceanOpportunity});
  const metadata=buildSnapshotMetadata({observationSnapshot,intelligenceSnapshot,captureMode:'live',sourceType:'live-observation',lifecycleState:'live',reconstructionStatus:'not-applicable'});
  return {oceanOpportunity,signals:resolveOceanSignals({oceanOpportunity}),observationSnapshot,intelligenceSnapshot,metadata,
    oceanSnapshot:buildOceanSnapshot({snapshotMetadata:metadata,observationSnapshot,intelligenceSnapshot})};
}
function leaves(value,path=''){
  if(value&&typeof value==='object'&&Object.keys(value).length)return Object.entries(value).flatMap(([k,v])=>leaves(v,path?path+'.'+k:k));
  return [[path,value]];
}
function changes(a,b){const right=Object.fromEntries(leaves(b));return leaves(a).filter(([p,v])=>JSON.stringify(v)!==JSON.stringify(right[p])).map(([p])=>p);}

test('three captures close marine inputs but do not encode historical interpretation context',async t=>{
  const b=bundle(await parsed(t)),before=JSON.stringify(b.captures);
  const a=snapshots(b,time,buildOceanPersistence({historicalSnapshots:[]}));
  const c=snapshots(b,time,buildOceanPersistence({historicalSnapshots:histories()}));
  assert.notDeepEqual(a.oceanOpportunity.persistenceContext,c.oceanOpportunity.persistenceContext);
  assert.notDeepEqual(a.intelligenceSnapshot,c.intelligenceSnapshot);
  assert.equal(JSON.stringify(b.captures),before);
  assert(a.oceanOpportunity.persistenceContext.limitations.includes('persistence-context-is-documentary-only'));
  console.log(JSON.stringify({diagnostic:'DOCUMENTARY_HISTORY_NOT_CURRENT_EVIDENCE',changedFields:changes(a,c)}));
});
test('retrieval timestamp changes complete snapshot fields with identical evidence and quality time',async t=>{
  const m=await parsed(t),b=bundle(m),p=buildOceanPersistence({});
  const a=snapshots(b,'2026-09-24T01:00:00Z',p),c=snapshots(b,'2030-01-01T00:00:00Z',p);
  assert.deepEqual(a.oceanOpportunity,c.oceanOpportunity);assert.notDeepEqual(a.observationSnapshot,c.observationSnapshot);
  assert.notDeepEqual(a.intelligenceSnapshot,c.intelligenceSnapshot);assert.notDeepEqual(a.metadata,c.metadata);
  assert.equal(a.observationSnapshot.observedAt,c.observationSnapshot.observedAt);
  assert.deepEqual(bundle({...m,retrievedAt:'2030-01-01T00:00:00Z'}).captures,b.captures);
  console.log(JSON.stringify({diagnostic:'RETRIEVAL_METADATA_NOT_REPRESENTED_TIME',changedFields:changes(a,c)}));
});
test('complete explicitly supplied documentary facts replay without execution clock or network',async t=>{
  const b=bundle(await parsed(t)),p=buildOceanPersistence({historicalSnapshots:histories()}),a=snapshots(b,time,p);
  t.mock.method(globalThis,'fetch',()=>{throw Error('network forbidden');});t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});
  assert.deepEqual(snapshots(b,time,p),a);
});
for(const [name,opts] of [['complete',{}],['degraded',{weather:{wind_speed_10m:undefined}}],['rejected',{weatherFail:true}],
  ['fulfilled missing',{weather:{wind_speed_10m:undefined,wind_gusts_10m:undefined,wind_direction_10m:undefined}}],
  ['zero',{weather:{wind_speed_10m:0,wind_gusts_10m:0,wind_direction_10m:0}}],['directional',{marine:{wave_direction:270,wave_period:3}}]])
test('qualified current marine composition remains exact: '+name,async t=>{bundle(await parsed(t,opts));});
test('route inspection locks documentary history, retrieval-time and species boundaries',()=>{
  const s=readFileSync(new URL('../server.js',import.meta.url),'utf8');
  const route=s.slice(s.indexOf('async function getOceanConditionsAtAssessment('),s.indexOf('export function createPeloraServer('));
  for(const anchor of ['retrieveOceanMemoryRows({','buildOceanMemoryTimeSeries({','buildOceanPersistence({','generatedAt:\n      marine.retrievedAt','const blueMarlinHabitat ='])
    assert(route.replaceAll('\r\n','\n').includes(anchor),anchor);
  assert(route.includes('observationSnapshot,')&&route.includes('intelligenceSnapshot,')&&route.includes('oceanSnapshot,'));
});
