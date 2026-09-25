// Stage 1 STOP diagnostic: never acquire data and never substitute product/time authority.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {DIRECTORY,SOURCE_SHA256,normalizePilot,NOMINAL_TIME} from '../../review/noaa-sst-pilot/pilot.mjs';
import {decodeNetcdf} from '../../review/noaa-sst-pilot/netcdf.mjs';
import {assessSstTransitionConfidence} from '../server.js';
import {environmentalObservationV1} from '../temporalEvidencePrimitives.mjs';
const bytes=readFileSync(`${DIRECTORY}source.nc`);
assert.equal(createHash('sha256').update(bytes).digest('hex'),SOURCE_SHA256);
const receipt=JSON.parse(readFileSync(`${DIRECTORY}acquisition.receipt.json`,'utf8').replace(/^\uFEFF/,''));
const {frame}=normalizePilot(decodeNetcdf(bytes),receipt);
const assessment={contractVersion:'pelora-scientific-assessment-v1',assessmentAt:'2026-09-24T01:00:00.000Z'};
function confidence(observedAt){return assessSstTransitionConfidence({assessment,samples:['north','east','south','west'].map(direction=>({direction,temperatureFahrenheit:80,observedAt})),sufficientCoverage:true,rangeFahrenheit:0,orientation:null});}

test('retained qualified source preserves unknown support and null observation time',()=>{
  assert.equal(frame.temporal.support.kind,'unknown');assert.equal(frame.temporal.observationTime,null);
  assert.equal(frame.product.evidenceClass,'ANALYSIS');assert.equal(frame.product.providerId,'NOAA-NESDIS-OSPO');
  assert.notEqual(frame.product.providerId,'Open-Meteo');
  assert(frame.provenance.steps.some(s=>s.parameters.some(p=>p.name==='nominalTime' && Date.parse(p.value)===Date.parse(NOMINAL_TIME))));
});
test('missing represented time remains unknown in actual current confidence consumer',()=>{
  const r=confidence(frame.temporal.observationTime);assert.equal(r.sampleAgeHours,null);assert(r.reasons.includes('sample-time-unavailable'));
});
test('substituting nominal time manufactures an age absent from qualified observation time',()=>{
  const unknown=confidence(frame.temporal.observationTime),substituted=confidence(NOMINAL_TIME);
  assert.equal(unknown.sampleAgeHours,null);assert.equal(substituted.sampleAgeHours,37);
  assert.notDeepEqual(unknown,substituted); // Deliberately invalid projection, never an adapter output.
});
test('source grid cannot silently become a qualified candidate point via the existing primitive',()=>{
  assert.equal(frame.payload.layout,'rectilinear-grid');
  assert.throws(()=>environmentalObservationV1({frame,componentIndex:0,sampleIndex:1}));
});
test('source components cannot stand in for chlorophyll or current evidence',()=>{
  assert.deepEqual(frame.payload.components.map(c=>c.variableId),['analysed_sst','analysis_error','mask']);
  assert(!frame.payload.components.some(c=>['chlor_a','u_current','v_current'].includes(c.variableId)));
});
test('represented-time absence is stable with implicit wall clock forbidden',t=>{
  const before=confidence(null);t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});assert.deepEqual(confidence(null),before);
});
test('source map fails Stage 1 and prevents downstream stage qualification',()=>{
  const m=JSON.parse(readFileSync(new URL('../../docs/Candidate_Current_Evidence_Source_Map_v1.json',import.meta.url),'utf8'));
  assert.equal(m.verdict,'MISSING_GOVERNED_SOURCE');assert.equal(m.adapterImplemented,false);assert.equal(m.stage1Passed,false);
  assert.equal(m.stages2And3Started,false);assert.equal(m.checkpointPermitted,false);
  assert(m.blockingMissingFields>0);assert.equal(m.blockingMissingFields,m.fields.filter(f=>f.blocking && f.comparison==='MISSING_GOVERNED_SOURCE').length);
});
