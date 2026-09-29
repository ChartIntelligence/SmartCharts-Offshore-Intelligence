import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {assessOceanConditions,resolveChlorophyllObservation,buildCurrentVectorProjectionAnalysis} from '../server.js';
import {normalizeBathymetryElevationV1,normalizeEtopoWaterMaskObservationV1} from '../bathymetryEvidence.js';
import {prepare,reconstruct} from './fixtures/exactMarineCaptureFixture.mjs';
import {currentSupport} from './fixtures/marineAssessorCompanionFixture.mjs';
import {fields,states,parse,encode,representation} from './fixtures/sourceNormalizationFixture.mjs';
const evidence={fields,rows:[],consequences:[],staticRows:[]};
after(()=>{if(process.env.PELORA_WRITE_NORMALIZATION==='1')writeFileSync('.local/ocean-quarantine/task12b7a/evidence.json',JSON.stringify(evidence,null,2)+'\n');});
function classify(name,value){if(value===null||value===undefined)return ['null','missing','undefined','empty-string'].includes(name)?'MISSINGNESS_PRESERVED':'REJECTED_FAIL_CLOSED';if(['positive-zero','negative-zero'].includes(name))return 'LEGITIMATE_ZERO_PRESERVED';if(name==='null'&&value===0)return 'NULL_COERCED_TO_ZERO';if(name==='missing'&&value===0)return 'MISSING_COERCED_TO_ZERO';if(['whitespace','empty-string','object','array','numeric-array','boolean'].includes(name)&&Number.isFinite(value))return 'MALFORMED_COERCED_TO_NUMBER';if(typeof value==='number'&&!Number.isFinite(value))return 'NONFINITE_ACCEPTED';return 'OTHER_REVIEW_REQUIRED';}
test('every field/state passes actual parser; non-JSON values remain explicitly internal',async t=>{
 for(const field of fields)for(const [name,value]of states){try{const r=await parse(t,field,name,value);evidence.rows.push({fieldId:field.id,state:name,representation:representation(name),input:encode(value),output:encode(r.value),classification:classify(name,r.value),availability:r.result.source?.availability??r.result.wind?.source?.availability??null});assert(!(typeof r.value==='number'&&!Number.isFinite(r.value)),field.id+name);if(field.conversion==='strict'&&['null','numeric-string','array'].includes(name))assert.equal(r.value,null);}catch(e){evidence.rows.push({fieldId:field.id,state:name,representation:representation(name),classification:'REJECTED_FAIL_CLOSED',error:e.message});if(e.code==='ERR_ASSERTION')throw e;}}
});
test('null speed gust and heights become zero; directions and periods preserve null',async t=>{
 for(const field of fields.filter(f=>f.parser==='marine'&&!f.id.includes('latitude')&&!f.id.includes('longitude'))){const a=await parse(t,field,'null',null),b=await parse(t,field,'missing'),z=await parse(t,field,'positive-zero',0),nz=await parse(t,field,'negative-zero',-0);if(['knots','feet'].includes(field.conversion)){assert.equal(a.value,0);assert.equal(b.value,null);assert.equal(z.value,0);assert.equal(nz.value,0);}else assert.equal(a.value,null);}
});
test('null-only gust creates available wind and consumable marine state; exact replay preserves normalization',async t=>{
 const field=fields.find(f=>f.key==='wind_gusts_10m');const n=(await parse(t,field,'null',null,{allMissing:true})).result,m=(await parse(t,field,'missing',undefined,{allMissing:true})).result,z=(await parse(t,field,'positive-zero',0,{allMissing:true})).result;
 assert.equal(n.wind.source.availability,'available');assert.equal(m.wind.source.availability,'provider-returned-null');assert.deepEqual(n.wind,z.wind);
 const complete=(await parse(t,field,'null',null)).result;const p=prepare(complete),r=reconstruct(p.wires,p.refs,p.support);assert.deepEqual(p.A,r.B);assert.equal(r.r.wind.gustKnots,0);
 evidence.consequences.push({id:'gust-null-vs-missing',nullWind:n.wind,missingWind:m.wind,numericZeroWind:z.wind,assessorNull:assessOceanConditions(n),assessorMissing:assessOceanConditions(m),replay:'REPLAY_EQUIVALENT_NOT_NORMALIZATION_QUALIFIED'});
});
test('current null component preserves no-valid-pixel but manufactures zero speed; whitespace supplies vector',async t=>{
 const field=fields.find(f=>f.key==='u_current');const n=(await parse(t,field,'null',null)).result,w=(await parse(t,field,'whitespace',' ')).result;assert.equal(n.eastwardMetersPerSecond,null);assert.equal(n.speedKnots,0);assert.equal(n.source.availability,'no-valid-pixel');assert.equal(w.eastwardMetersPerSecond,0);assert.equal(w.source.availability,'available');evidence.consequences.push({id:'current-component',null:n,whitespace:w});
});
test('empty tables and rejected acquisition remain separate; finite provider sentinel is not filtered',async t=>{
 for(const parser of ['direct','gap','current']){const field=fields.find(f=>f.parser===parser);const e=(await parse(t,field,'null',null,{empty:true})).result;assert.equal(e.source.availability,'no-valid-pixel');await assert.rejects(()=>parse(t,field,'null',null,{reject:true}));const fill=(await parse(t,field,'positive',-214748.3648)).result;evidence.consequences.push({id:parser+'-empty-fill',empty:e,finiteSentinel:fill,sentinelApplicability:parser==='current'?'Previously recorded NOAA current fill metadata':'Adversarial finite value; not claimed chlorophyll provider sentinel'});}
});
test('ordinary JS parser objects invoke getters and accept inherited values; private extra keys are not copied',async t=>{
 for(const parser of ['marine','direct','gap','current']){const field=fields.find(f=>f.parser===parser);for(const name of ['getter','inherited']){const r=await parse(t,field,name);assert(Number.isFinite(r.value));if(name==='getter')assert(r.getterCalls>0);evidence.consequences.push({id:field.id+':'+name,classification:'INTERNAL_ONLY',output:encode(r.value),getterCalls:r.getterCalls});}const r=await parse(t,field,'positive',2,{privateMetadata:true});assert(!JSON.stringify(r.result).includes('PRIVATE_SENTINEL'));}
});
test('static numeric normalization is separate and rejects missing/malformed objects',()=>{
 for(const [name,value]of states)evidence.staticRows.push({state:name,representation:representation(name),candidate:encode(normalizeBathymetryElevationV1(value)),etopo:normalizeEtopoWaterMaskObservationV1(value)});
 assert.equal(normalizeBathymetryElevationV1(null),null);assert.equal(normalizeBathymetryElevationV1(' '),null);assert(Object.is(normalizeBathymetryElevationV1(-0),-0));assert.equal(normalizeEtopoWaterMaskObservationV1([]).elevationMeters,null);
});
test('all marine null versus missing versus real zero effects traverse unchanged quality and assessor',async t=>{
 for(const field of fields.filter(f=>f.parser==='marine'&&['knots','feet','safe'].includes(f.conversion))){const rows=[];for(const [name,value]of [['null',null],['missing',undefined],['positive-zero',0]]){const m=(await parse(t,field,name,value)).result;const q=currentSupport(m).quality(m);rows.push({state:name,normalized:m[field.path.split('.')[0]],quality:q,assessor:assessOceanConditions({...m,dataQuality:q})});}if(['knots','feet'].includes(field.conversion)){assert.deepEqual(rows[0].quality,rows[2].quality);assert.deepEqual(rows[0].assessor,rows[2].assessor);}evidence.consequences.push({id:field.id+':quality-assessor',rows});}
});
test('all component signed-zero pairs are accepted; parser rounding does not preserve raw negative-zero components',async t=>{
 const field=fields.find(f=>f.key==='u_current');for(const u of [0,-0])for(const v of [0,-0]){const r=(await parse(t,field,'negative-zero',u,{rowOverrides:{u_current:u,v_current:v}})).result;assert.equal(r.source.availability,'available');assert(Object.is(r.eastwardMetersPerSecond,0));assert(Object.is(r.northwardMetersPerSecond,0));evidence.consequences.push({id:'signed-zero-pair',input:[encode(u),encode(v)],components:[encode(r.eastwardMetersPerSecond),encode(r.northwardMetersPerSecond)],direction:encode(r.directionDegrees),speed:encode(r.speedKnots)});}
});
test('malformed transport becomes usable chlorophyll and current projection evidence',async t=>{
 for(const parser of ['direct','gap']){const field=fields.find(f=>f.parser===parser),n=(await parse(t,field,'null',null)).result,w=(await parse(t,field,'whitespace',' ')).result;const unavailable=resolveChlorophyllObservation({observations:[n]}),usable=resolveChlorophyllObservation({observations:[w]});assert.equal(unavailable.available,false);assert.equal(usable.available,true);assert.equal(usable.selectedObservation.concentrationMgM3,0);evidence.consequences.push({id:parser+':resolution',unavailable,usable});}
 const field=fields.find(f=>f.key==='u_current');const n=(await parse(t,field,'null',null)).result,w=(await parse(t,field,'array',[])).result;const unavailable=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...n}]}),usable=buildCurrentVectorProjectionAnalysis({vectors:[{direction:'north',...w}]});assert.notDeepEqual(unavailable,usable);evidence.consequences.push({id:'current:projection',unavailable,usable});
});
