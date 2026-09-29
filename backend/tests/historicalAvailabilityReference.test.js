import test from 'node:test';import assert from 'node:assert/strict';
import {captureFixture,at,context,frame,observation,publication,witnessedFixture,conceptualAvailability,metadataReference} from './fixtures/historicalAvailabilityReferenceFixture.mjs';
import {captureCurrentEvidenceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2} from '../currentEvidenceCaptureV2.mjs';
import {freezeEvidenceV1,validatePublicationV3,publicationV3} from '../../shared/oceanPublication.mjs';
const capture=(family='SST',value=26)=>{const x=captureFixture(family);if(family==='SST'){x.samples[0].point.temperatureCelsius=value;x.samples[0].point.temperatureFahrenheit=value*9/5+32;}return captureCurrentEvidenceV2(x);};
const ref=c=>currentCaptureReferenceV2(c);
for(const h of [-1,0,1])test('trusted exact receipt relative to assessment '+h,()=>{
 const c=capture(),f=witnessedFixture(ref(c),at(h));assert.equal(conceptualAvailability(f.record,ref(c),context(0),f.witnesses),h<=0);
});
test('repeated receipt does not create observation; earliest-ever receipt not required',()=>{
 const c=capture(),a=witnessedFixture(ref(c),at(-3),'event-a'),b=witnessedFixture(ref(c),at(-1),'event-b');
 assert.deepEqual(a.record.evidenceReference,b.record.evidenceReference);assert(conceptualAvailability(b.record,ref(c),context(0),b.witnesses));assert.notDeepEqual(metadataReference(a.record),metadataReference(b.record));
});
test('revision substitution rejected despite same represented time; reverse receipt order selects neither preference',()=>{
 const a=capture('SST',26),b=capture('SST',27),wa=witnessedFixture(ref(a),at(-1)),wb=witnessedFixture(ref(b),at(1));
 assert.equal(a.samples[0].point.observedAt,b.samples[0].point.observedAt);assert.throws(()=>conceptualAvailability(wa.record,ref(b),context(0),wa.witnesses));assert(!conceptualAvailability(wb.record,ref(b),context(0),wb.witnesses));
 const lateA=witnessedFixture(ref(a),at(1));assert(!conceptualAvailability(lateA.record,ref(a),context(0),lateA.witnesses));const earlyB=witnessedFixture(ref(b),at(-1));assert(conceptualAvailability(earlyB.record,ref(b),context(0),earlyB.witnesses));assert.notDeepEqual(ref(a),ref(b));
});
test('represented time and signed zero remain bound to existing exact capture identity',()=>{
 const a=capture(),input=captureFixture();input.samples[0].point.observedAt=at(-1);const b=captureCurrentEvidenceV2(input);assert.throws(()=>validateCurrentCaptureReferenceV2(ref(a),b));
 const plus=capture('SST',0),minus=capture('SST',-0);assert.notDeepEqual(ref(plus),ref(minus));
});
test('normalization content difference cannot inherit old receipt',()=>{
 const a=capture(),input=captureFixture();input.samples[0].point.temperatureCelsius=null;input.samples[0].point.temperatureFahrenheit=null;input.samples[0].point.source.availability='unavailable';const b=captureCurrentEvidenceV2(input),f=witnessedFixture(ref(a),at(-1));assert.throws(()=>conceptualAvailability(f.record,ref(b),context(0),f.witnesses));
});
for(const kind of ['missing-authority','late-tamper','invalid-time','ambiguous-time','digest','version','family','private','inherited','getter'])test('fail closed '+kind,()=>{
 const c=capture(),f=witnessedFixture(ref(c),at(-1));let r=structuredClone(f.record),w=f.witnesses,hits=0;
 if(kind==='missing-authority')w=new Map();if(kind==='late-tamper')r.receivedAt=at(-2);if(kind==='invalid-time')r.receivedAt='not-a-time';if(kind==='ambiguous-time')r.receivedAt='2026-09-24T00:00:00';if(kind==='digest')r.evidenceReference.sha256='a'.repeat(64);if(kind==='version')r.evidenceReference.contractVersion='wrong-v1';if(kind==='family')r.evidenceReference=ref(capture('CURRENTS'));if(kind==='private')r.captain='private';if(kind==='inherited')r=Object.assign(Object.create({receivedAt:at(-1)}),r);if(kind==='getter')Object.defineProperty(r,'receivedAt',{enumerable:true,get(){hits++;return at(-1);}});
 assert.throws(()=>conceptualAvailability(r,ref(c),context(0),w));assert.equal(hits,0);
});
test('self-consistent fabricated receipt hash is not external authority',()=>{
 const c=capture(),f=witnessedFixture(ref(c),at(-1));assert(metadataReference(f.record).sha256);assert.throws(()=>conceptualAvailability(f.record,ref(c),context(0),new Map()));
});
test('deterministic replay uses explicit history, no current clock',t=>{
 const c=capture(),f=witnessedFixture(ref(c),at(-1));t.mock.method(Date,'now',()=>{throw Error('clock forbidden');});assert(conceptualAvailability(f.record,ref(c),context(0),f.witnesses));assert(conceptualAvailability(JSON.parse(JSON.stringify(f.record)),ref(c),context(0),f.witnesses));
});
test('support and availability are independent authorities',()=>{
 for(const kind of ['instant','interval','composite-window','static']){const f=frame(-2);f.temporal.support=kind==='instant'?{kind,at:at(-2)}:kind==='static'?{kind}:{kind,start:at(-3),end:at(1)};if(kind==='static'){f.temporal.observationTime=null;f.product.evidenceClass='STATIC_MODEL';}assert(observation(f).observationId);}
});
test('V3 lineage can bind availability metadata without schema amendment',()=>{
 const p=publication(),c=capture(),f=witnessedFixture(ref(c),at(-1)),entries=structuredClone(p.evidence.entries);entries[0].lineageReferences.push(metadataReference(f.record));const evidence=freezeEvidenceV1(p.cycle,entries);const evaluation={...p.evaluation,evidenceSetId:evidence.evidenceSetId};const result=publicationV3({cycle:p.cycle,evidence,history:p.history,attempt:p.attempt,evaluation});assert(validatePublicationV3(result));assert.notEqual(result.contentDigest,p.contentDigest);
});

test('weather/marine and companion exact references compose without successor',async t=>{
 const {parsed,inputs}=await import('./fixtures/marineAssessorCompanionFixture.mjs');const {qualityCaptureInput}=await import('./fixtures/weatherMarineQualityFixture.mjs');const q=await import('../weatherMarineQualityCaptureV2.mjs'),m=await import('../marineAssessorCompanionCaptureV2.mjs');const raw=await parsed(t),quality=q.captureWeatherMarineQualityV2(qualityCaptureInput(raw)),qr=q.weatherMarineQualityReferenceV2(quality);const companion=m.captureMarineAssessorCompanionV2({...inputs(raw).input,qualityReference:qr},quality),cr=m.marineAssessorCompanionReferenceV2(companion,quality);for(const reference of [qr,cr]){const f=witnessedFixture(reference,at(-1));assert(conceptualAvailability(f.record,reference,context(0),f.witnesses));}
});
for(const family of ['CHLOROPHYLL_DIRECT','CHLOROPHYLL_GAP_FILLED'])test(family+' endpoint availability composes without qualifying support or temporal arithmetic',()=>{const input=captureFixture(family);input.samples[0].point.concentrationMgM3=1e308;const c=captureCurrentEvidenceV2(input),f=witnessedFixture(ref(c),at(-1));assert(conceptualAvailability(f.record,ref(c),context(0),f.witnesses));assert.equal(c.family,family);});

test('full Frame identity binds exact sample and rejects readdressed or changed content',async()=>{const {validateEnvironmentalObservationV1}=await import('../temporalEvidencePrimitives.mjs');const f=frame(-1),o=observation(f);assert.deepEqual(validateEnvironmentalObservationV1(o,f),o);const altered=structuredClone(f);altered.payload.components[0].values[0]=85;assert.throws(()=>validateEnvironmentalObservationV1(o,altered));const readdressed=structuredClone(o);readdressed.sampleIndex=1;assert.throws(()=>validateEnvironmentalObservationV1(readdressed,f));});
