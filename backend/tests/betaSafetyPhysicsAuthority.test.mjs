import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixtures/scientificAssessmentFixture.js';
import {run} from './fixtures/convergenceDecisionFixture.mjs';
import {assessOceanEvidence,assessOceanOpportunity,assessBlueMarlinHabitat,resolveOceanSignals,
  buildUnifiedSpeciesOpportunityInterpretationV1,resolveUnifiedOpportunityRankingInputV1,
  translateUnifiedOpportunityIntelligenceV1,translateCaptainOpportunityNarrativeV1} from '../server.js';

// Bounded admission/presentation verification, not qualification of paused Physics.
function evaluate(input) {
  const f=fixture(),o=structuredClone(input);
  o.oceanEvidence=assessOceanEvidence({latitude:f.candidate.coordinates[0],longitude:f.candidate.coordinates[1],...o});
  o.oceanOpportunity=assessOceanOpportunity({oceanEvidence:o.oceanEvidence});
  o.blueMarlinHabitat=assessBlueMarlinHabitat(o);
  o.oceanSignals=resolveOceanSignals({oceanOpportunity:o.oceanOpportunity});
  const interpretation=buildUnifiedSpeciesOpportunityInterpretationV1({candidate:f.candidate,oceanConditions:o,species:'blue-marlin',
    assessment:{contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-26T01:00:00.000Z'}});
  const gate=resolveUnifiedOpportunityRankingInputV1({speciesInterpretation:interpretation});
  const narrative=translateCaptainOpportunityNarrativeV1({intelligenceTranslation:translateUnifiedOpportunityIntelligenceV1({species:'blue-marlin',intelligenceSource:interpretation.intelligenceSource})});
  return {o,gate,interpretation,narrative};
}
function authority(r){return {habitat:r.o.blueMarlinHabitat,opportunity:r.o.oceanOpportunity,signals:r.o.oceanSignals,gate:r.gate,narrative:r.narrative};}
const diagnostics={
  convergence:{available:true,convergenceState:'candidate',convergenceType:'pronounced-convergence-candidate',currentConvergenceDetected:true},
  shear:{available:true,currentShearDetected:true,shearStrength:'pronounced'},
  edge:{available:true,currentEdgeDetected:true,edgeStrength:'pronounced'},
  eddyBoundary:{available:true,eddyBoundaryDetected:true}
};
for(const key of Object.keys(diagnostics))test('diagnostic '+key+' cannot grant ranking, change habitat score/confidence or leak through Captain Narrative',()=>{
  const base=structuredClone(fixture().ocean),changed=structuredClone(base);
  changed.currents.derived.spatialAnalysis[key]=diagnostics[key];
  const a=evaluate(base),b=evaluate(changed);
  assert.equal(a.gate.eligibleForRanking,false);assert.equal(b.gate.eligibleForRanking,false);
  assert.deepEqual(authority(b),authority(a));
  assert.equal(b.o.oceanEvidence.groups.current.available,true);
  assert.equal(b.o.oceanEvidence.groups.current.values.speedKnots,base.currents.speedKnots);
  assert.equal(b.o.currents.eastwardMetersPerSecond,base.currents.eastwardMetersPerSecond);
  assert.deepEqual(b.o.currents.derived.spatialAnalysis.spatialStructure.vectors,base.currents.derived.spatialAnalysis.spatialStructure.vectors);
});
for(const thermal of ['uniform','strong'])test('actual default runtime advanced-current patterns do not promote Opportunity authority: '+thermal,async t=>{
  const rows=[];
  for(const current of ['uniform','edge','shear','convergence','divergence','rotation']){
    const {ocean}=await run(t,{thermal,current,sourceTime:'2026-09-26T00:00:00Z'},Date.parse('2300-01-01')+rows.length*400000);
    const result=evaluate(ocean);rows.push(result);
    assert.equal(result.narrative.available,true);
    assert(Object.keys(result.narrative.sections).length>0);
    assert.equal(ocean.oceanEvidence.groups.current.available,true);
    assert(Number.isFinite(ocean.currents.eastwardMetersPerSecond));
    assert.equal(ocean.currents.derived.spatialAnalysis.spatialStructure.vectors.length,4);
    assert.deepEqual(authority(result),authority(rows[0]));
    // Positive statements must not assert these paused interpretations. Limitation prose may name them.
    for(const section of Object.values(result.narrative.sections??{})){
      const positive=[section?.observed,section?.interpreted,section?.supported].filter(Boolean).join(' ');
      assert.doesNotMatch(positive,/convergence|divergence|shear|upwelling|downwelling|current edge/i);
    }
  }
});
