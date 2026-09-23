import assert from 'node:assert/strict';
import {test} from 'node:test';
import {emptyLocationDraft, hasLocationDraft, parseCoordinateText, addManualLocation, legacyFishingLocations, removeLocation} from '../fishingLogSpatialCapture.js';
import {captureReportTime, createTemporalDraft, insertReportWithTime} from '../fishingLogTemporalCapture.js';
import {buildFishingLocationSpatialEvidenceV1 as interpret} from '../../../../shared/fishingLocationSpatialEvidence.mjs';

const draft = extra => ({...emptyLocationDraft(), latitude:'29.5', longitude:'-86.2', ...extra});
test('strict signed decimal parsing preserves incomplete or unsupported input without coercion', () => {
  for (const text of ['-', '+', '', '  ', '29.', '-87.', '.', '29abc', '29,5', '29.5, -87.5', '29°30′', '29 30.5', '1e2','0x20','29,-86','29N','29 30','Infinity','NaN','12junk']) {
    assert.equal(parseCoordinateText(text),null);
    const d=draft({latitude:text}); const before=JSON.stringify(d);
    assert.equal(addManualLocation(d).location,null); assert.equal(JSON.stringify(d),before);
  }
  for (const [text,value] of [['29',29],['29.5',29.5],['0',0],['-0',-0],['90',90],['-90',-90],['180',180],['-180',-180],['-87.5',-87.5],['+29.5',29.5],[' .5 ',.5],['-.5',-.5]]) assert.equal(parseCoordinateText(text),value);
});
test('blank, one-axis, range and boundary handling delegates geographic validity to 7C', () => {
  assert.deepEqual(addManualLocation(emptyLocationDraft()),{location:null,errors:{}});
  for (const field of ['latitude','longitude']) {
    const result=addManualLocation(draft({[field]:''})); assert.equal(result.location,null); assert.match(result.errors[field],/both/);
  }
  for (const [latitude,longitude] of [[0,0],[-90,-180],[90,180]]) {
    const result=addManualLocation(draft({latitude:String(latitude),longitude:String(longitude)}),()=>undefined);
    assert.equal(result.location.latitude,latitude); assert.equal(result.location.longitude,longitude);
  }
  for (const [field,value] of [['latitude','-91'],['latitude','91'],['longitude','-181'],['longitude','181']]) {
    const result=addManualLocation(draft({[field]:value})); assert.equal(result.location,null); assert.match(result.errors[field],/between/);
  }
});
test('source characterization label and identity are explicit source facts only', () => {
  let calls=0; const uuid=()=>`test-entry-${++calls}`;
  for (const [selection,certainty,quality] of [['exact-as-reported','exact-as-reported','precise'],['approximate','approximate','approximate'],['unknown','unknown','unknown'],['','unknown','unknown']]) {
    const location=addManualLocation(draft({certainty:selection,label:' Morning stop '}),uuid).location;
    assert.equal(location.source,'manual'); assert.equal(location.certainty,certainty); assert.equal(location.label,' Morning stop ');
    assert.equal(interpret(location).quality,quality); assert.equal('accuracy' in location,false);
    assert.deepEqual(Object.keys(location).sort(),['certainty','label','latitude','locationEntryId','longitude','source']);
  }
  assert.equal(calls,4);
  const first=addManualLocation(draft(),uuid).location, second=addManualLocation(draft(),uuid).location;
  assert.notEqual(first.locationEntryId,second.locationEntryId);
  assert.deepEqual(removeLocation([first,second],first),[second]);
  assert.notEqual(addManualLocation(draft(),uuid).location.locationEntryId,first.locationEntryId);
  for (const factory of [()=>undefined,()=>{throw Error('unavailable');}]) {
    const a=addManualLocation(draft({label:'  '}),factory).location, b=addManualLocation(draft(),factory).location;
    assert.equal('locationEntryId' in a,false); assert.equal('label' in a,false); assert.deepEqual(removeLocation([a,b],a),[b]);
  }
});
test('meaningful unadded input includes only nonblank text or explicit characterization', () => {
  assert.equal(hasLocationDraft(emptyLocationDraft()),false);
  assert.equal(hasLocationDraft({...emptyLocationDraft(),latitude:' ',longitude:'\t',label:'\n'}),false);
  for (const field of ['latitude','longitude','label','certainty']) assert.equal(hasLocationDraft({...emptyLocationDraft(),[field]:field==='certainty'?'unknown':'x'}),true);
});
test('atomic source capture preserves temporal meaning and enriched identity; legacy coordinates remain minimal', async () => {
  const location=addManualLocation(draft({certainty:'approximate',label:'Edge'}),()=> 'fixed-test-id').location;
  const report={...createTemporalDraft(new Date(2026,8,22),'America/Chicago'),linesIn:'20:00',linesOut:'04:00',endMode:'next',basisConfirmed:true,fishingLocations:[location]};
  const capture=captureReportTime(report);
  assert.equal(capture.temporal.captainInput.end.date,'2026-09-23');
  assert.equal(capture.locations[0].locationEntryId,'fixed-test-id');
  assert.equal(capture.locations[0].certainty,'approximate'); assert.equal('quality' in capture.locations[0],false);
  assert.deepEqual(legacyFishingLocations([location]),[{latitude:29.5,longitude:-86.2}]);
  let calls=0; const payloads=[];
  const client={from(){return {insert(payload){calls++;payloads.push(payload);return {select(){return {single:async()=>({error:new Error('test failure')})};}};}};}};
  for(let i=0;i<2;i++) await assert.rejects(insertReportWithTime(client,{fishing_locations:legacyFishingLocations(report.fishingLocations)},report));
  assert.equal(calls,2); assert.deepEqual(payloads[0],payloads[1]);
  assert.deepEqual(payloads[0].evidence_capture,capture);
  assert.equal(location.locationEntryId,'fixed-test-id');
});

test('browser UUID adapter runs only on accepted Add; interpretation and capture never regenerate identity', () => {
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'crypto');
  let calls=0;
  try {
    Object.defineProperty(globalThis,'crypto',{configurable:true,value:{randomUUID:()=>`browser-test-${++calls}`}});
    addManualLocation(emptyLocationDraft());addManualLocation(draft({latitude:'-'}));addManualLocation(draft({latitude:'91'}));
    assert.equal(calls,0);
    const a=addManualLocation(draft()).location,b=addManualLocation(draft()).location;
    assert.equal(calls,2);assert.notEqual(a.locationEntryId,b.locationEntryId);
    interpret(a);captureReportTime({...createTemporalDraft(),fishingLocations:[a,b]});legacyFishingLocations([a,b]);
    assert.equal(calls,2);
    for(const crypto of [{},{randomUUID(){throw Error('unavailable');}}]) {
      Object.defineProperty(globalThis,'crypto',{configurable:true,value:crypto});
      assert.equal(Object.hasOwn(addManualLocation(draft()).location,'locationEntryId'),false);
    }
  } finally {if(descriptor) Object.defineProperty(globalThis,'crypto',descriptor);else delete globalThis.crypto;}
});

test('long descriptive label survives capture and does not change spatial interpretation', () => {
  const label='Morning stop '.repeat(100);
  const plain=addManualLocation(draft({certainty:'exact-as-reported'}),()=>undefined).location;
  const named=addManualLocation(draft({certainty:'exact-as-reported',label}),()=>undefined).location;
  assert.equal(named.label,label);
  for(const key of ['quality','readiness','certainty','identityState']) assert.equal(interpret(named)[key],interpret(plain)[key]);
  assert.equal(captureReportTime({...createTemporalDraft(),fishingLocations:[named]}).locations[0].label,label);
});
