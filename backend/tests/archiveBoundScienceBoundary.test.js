// Task 12B.6 STOP diagnostic. No shared evaluator and no production archive adapter.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture} from './fixtures/scientificAssessmentFixture.js';
import {frame as pointFrame} from './fixtures/temporalEvidenceFixture.mjs';
import {writeOceanArchiveV1, readOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {assessOceanEvidence,assessOceanOpportunity,assessBlueMarlinHabitat,resolveOceanSignals,
  buildUnifiedSpeciesOpportunityInterpretationV1,resolveUnifiedOpportunityRankingInputV1,
  getMoonConditions,resolveOpportunityCandidateBathymetryV1,
  evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1,BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE} from '../server.js';

const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00.000Z'};
function science(input, history=null){
  const f=fixture(),o=structuredClone(input);
  o.oceanEvidence=assessOceanEvidence({latitude:f.candidate.coordinates[0],longitude:f.candidate.coordinates[1],...o});
  o.oceanOpportunity=assessOceanOpportunity({oceanEvidence:o.oceanEvidence,oceanPersistence:history});
  o.blueMarlinHabitat=assessBlueMarlinHabitat(o);
  o.oceanSignals=resolveOceanSignals({oceanOpportunity:o.oceanOpportunity});
  const interpretation=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:o,species:'blue-marlin',assessment});
  return {evidence:o.oceanEvidence,habitat:o.blueMarlinHabitat,interpretation,gate:resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:interpretation})};
}
function numericProjection(o){
  return {representedAt:o.observedAt,sst:o.sst.temperatureFahrenheit,chlorophyll:o.chlorophyll.concentrationMgM3,
    speed:o.currents.speedKnots,direction:o.currents.directionDegrees,
    sstNeighbors:o.sst.derived.spatialStructure.samples.map(s=>[s.observedAt,s.temperatureFahrenheit]),
    currentNeighbors:o.currents.derived.spatialAnalysis.spatialStructure.vectors.map(v=>[v.observedAt,v.speedKnots,v.directionDegrees,v.eastwardMetersPerSecond,v.northwardMetersPerSecond])};
}
function archiveFixture(){
  const f=pointFrame();f.frameId='synthetic-12b6-values';f.product.productId='synthetic-blocking-values';f.product.family='synthetic-multivariable';
  const o=fixture().ocean;f.payload.kind='multivariable';
  f.payload.components=[['sst','degF',o.sst.temperatureFahrenheit],['chlorophyll','mg.m-3',o.chlorophyll.concentrationMgM3],['speed','kn',o.currents.speedKnots],['direction','degree',o.currents.directionDegrees]]
    .map(([variableId,unit,value])=>({variableId,unit,axis:null,positiveDirection:null,values:[value],missing:[null]}));
  return f;
}
async function retained(){
  // Volatile test double simulates acknowledgement; no production durability claim.
  let record;
  const port={createIfAbsent:async(_id,r)=>{record=structuredClone(r);return {outcome:'created',durable:true,record};},readExact:async()=>({status:'found',durable:true,record})};
  const write=await writeOceanArchiveV1(port,archiveFixture(),{writeId:'synthetic',archivedAt:assessment.assessmentAt,storageReference:'synthetic-memory-only',sourceRevision:'synthetic-original',rawEvidence:[]});
  assert.equal(write.status,'ARCHIVED');
  return {port,write,record};
}

test('archive verifies exact scalar content but does not supply request scientific context',async()=>{
  const {port,write}=await retained();
  const r=await readOceanArchiveV1(port,{frameId:null,archiveId:write.receipt.archiveId});
  assert.equal(r.status,'ARCHIVED');assert.equal(r.receipt.frameDigest,write.receipt.frameDigest);assert.equal(r.receipt.contentDigest,write.receipt.contentDigest);
  assert.deepEqual(r.frame.payload.components.map(c=>c.values[0]),[80,0.1,1,90]);
  assert.equal(r.frame.temporal.observationTime,'2026-09-24T00:00:00.000Z');
  assert(!Object.hasOwn(r.frame,'dataQuality'));assert(!Object.hasOwn(r.frame,'candidateSampleSelection'));
});
for(const part of ['receipt','frame','contentDigest','frameDigest'])test('archive binding rejects corruption: '+part,async()=>{
  const {port,write,record}=await retained();
  if(part==='receipt')record.receipt.sourceRevision='swapped';
  if(part==='frame'){const f=JSON.parse(record.frameJson);f.frameId='swapped';record.frameJson=JSON.stringify(f);}
  if(part==='contentDigest'||part==='frameDigest')record.receipt[part]='0'.repeat(64);
  assert.equal((await readOceanArchiveV1(port,{frameId:null,archiveId:write.receipt.archiveId})).status,'ARCHIVE_INTEGRITY_FAILURE');
});
test('equal central numeric values do not identify candidate spatial interpretation',()=>{
  const full=structuredClone(fixture().ocean),without=structuredClone(full);
  const values=numericProjection(full);
  delete without.sst.derived.spatialStructure;delete without.currents.derived.spatialAnalysis;
  const a=science(full),b=science(without);
  assert.equal(full.sst.temperatureFahrenheit,without.sst.temperatureFahrenheit);
  assert.equal(full.currents.speedKnots,without.currents.speedKnots);
  assert.equal(a.interpretation.speciesOpportunity.score,24);assert.equal(b.interpretation.speciesOpportunity.score,27);
  assert.equal(a.interpretation.negativeConclusionAdequacy.adequate,true);assert.equal(b.interpretation.negativeConclusionAdequacy.adequate,false);
  console.log(JSON.stringify({case:'scalar-only-reconstruction-insufficient',classification:'MISMATCH',explained:true,
    numericEvidence:values,score:[24,27],adequacy:[true,false],verdict:'CURRENT_EVIDENCE_ADAPTER_QUALIFICATION_REQUIRED',
    caveat:'Deliberately incomplete reconstruction, not equivalent blocking inputs or an implemented shared evaluator'}));
});
test('all values/times retained but omitted sample source availability changes adequacy',()=>{
  const full=structuredClone(fixture().ocean),without=structuredClone(full);
  for(const s of without.sst.derived.spatialStructure.samples)delete s.source;
  for(const s of without.currents.derived.spatialAnalysis.spatialStructure.vectors)delete s.source;
  assert.deepEqual(numericProjection(full),numericProjection(without));
  assert.equal(science(full).interpretation.negativeConclusionAdequacy.adequate,true);
  assert.equal(science(without).interpretation.negativeConclusionAdequacy.adequate,false);
});
test('same values/provenance with omitted live-layer state changes surface-water adequacy',()=>{
  const a=structuredClone(fixture().ocean),b=structuredClone(a);b.dataQuality.layers.chlorophyll.state='unavailable';
  assert.deepEqual(numericProjection(a),numericProjection(b));
  assert.equal(science(a).interpretation.negativeConclusionAdequacy.predicates.surfaceWater,true);
  assert.equal(science(b).interpretation.negativeConclusionAdequacy.predicates.surfaceWater,false);
});
test('governed confidence input cannot be inferred from numeric archive payload alone',()=>{
  const a=structuredClone(fixture().ocean),b=structuredClone(a);a.dataQuality.score=0;b.dataQuality.score=100;
  assert.deepEqual(numericProjection(a),numericProjection(b));
  assert.equal(science(a).evidence.confidence.score,76);assert.equal(science(b).evidence.confidence.score,86);
  // Current route does not emit this optional scalar; do not manufacture one.
});
test('full frozen current-science replay and moon use explicit time without wall clock',t=>{
  const f=fixture(),first=science(f.ocean),moon=getMoonConditions(assessment.assessmentAt);
  t.mock.method(Date,'now',()=>{throw Error('implicit clock forbidden');});
  assert.deepEqual(science(f.ocean),first);assert.deepEqual(getMoonConditions(assessment.assessmentAt),moon);
});
test('history remains nonblocking; not the reason for the archive mapping STOP',()=>{
  const f=fixture(),a=science(f.ocean),b=science(f.ocean,{available:true,classification:'persistent',confidence:{score:99},values:{sampleCount:100}});
  // Documented oceanOpportunity/signal context is not included as blocking output.
  assert.deepEqual(a,b);assert.equal(a.habitat.relationshipGroups.persistence.score,0);
});
test('candidate bathymetry is shared static context and remains governed',()=>{
  const f=fixture(),bath=resolveOpportunityCandidateBathymetryV1(f.candidate);
  assert.equal(bath.available,true);
  assert.deepEqual(evaluateUnifiedOpportunityCandidateSpeciesEligibilityV1({candidate:f.candidate,speciesProfile:BLUE_MARLIN_OPPORTUNITY_TYPE_PROFILE}),f.candidate.eligibility);
});
test('production scalar delivery is not a candidate scientific sampler',()=>{
  const source=readFileSync(new URL('../../shared/oceanScalarFieldDelivery.mjs',import.meta.url),'utf8');
  assert(source.includes('source-index-decimation'));assert(!source.includes('buildUnifiedSpeciesOpportunityInterpretation'));
  const primitive=readFileSync(new URL('../temporalEvidencePrimitives.mjs',import.meta.url),'utf8');
  assert(primitive.includes("check(frame.payload.layout === 'points')"));
});
test('diagnostic matrix marks scientific reproduction unqualified without changing contracts',()=>{
  const m=JSON.parse(readFileSync(new URL('../../docs/Archive_Bound_Blue_Marlin_Boundary_v1.json',import.meta.url),'utf8'));
  assert.equal(m.verdict,'CURRENT_EVIDENCE_ADAPTER_QUALIFICATION_REQUIRED');assert.equal(m.sharedEvaluatorImplemented,false);
  assert(m.comparisons.filter(r=>r.classification==='MISMATCH').every(r=>r.explained===true));
  assert.equal(m.equivalenceQualified,false);assert.equal(m.baseline,'a20a9875b86eeb19d4447808c1db7269f4937661');
});
