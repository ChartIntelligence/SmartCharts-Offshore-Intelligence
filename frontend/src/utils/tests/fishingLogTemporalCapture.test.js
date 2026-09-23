import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {localCalendarDate, createTemporalDraft, updateTemporalDraft as update, endingDate,
  captureReportTime as capture, temporalGuidance, insertReportWithTime} from '../fishingLogTemporalCapture.js';
import {interpretFishingLogEvidenceCaptureV1 as interpret, projectFishingLogLegacyFieldsV1 as project} from '../../../../shared/fishingLogEvidenceCapture.mjs';

const draft = () => ({...createTemporalDraft(new Date(2026,8,22),'America/Chicago'),linesIn:'20:00',linesOut:'04:00',fishingLocations:[]});
test('local date default uses calendar getters, not UTC serialization', () => {
  const mock={getFullYear:()=>2026,getMonth:()=>8,getDate:()=>22,toISOString:()=> '2026-09-23T02:00:00Z'};
  assert.equal(localCalendarDate(mock),'2026-09-22');
  assert.equal(createTemporalDraft(mock,'America/Chicago').date,'2026-09-22');
});
test('ending date requires a choice; relative choices follow changed date without clock inference', () => {
  const r=draft(); assert.equal(endingDate(r),''); assert.equal(capture(r).temporal.captainInput.end.date,null);
  for (const [mode,first,changed] of [['same','2026-09-22','2026-12-31'],['next','2026-09-23','2027-01-01']]) {
    const selected=update(r,'endMode',mode); assert.equal(endingDate(selected),first);
    assert.equal(endingDate(update(selected,'date','2026-12-31')),changed);
  }
  const chosen={...r,endMode:'choose',endDate:'2026-09-25',basisConfirmed:true};
  const changed=update(chosen,'date','2026-09-26');
  assert.equal(endingDate(changed),'2026-09-25'); assert.equal(changed.basisConfirmed,false);
  assert.match(temporalGuidance({...changed,basisConfirmed:true}),/Check the ending date/);
});
test('suggestions require confirmation; basis and trip-date edits renew it', () => {
  const r={...draft(),endMode:'next'};
  assert.equal(capture(r).temporal.captainInput.timeBasis.confirmation,'suggested');
  assert.equal(interpret(capture(r)).temporalEvidence.interval,null);
  const confirmed=update(r,'basisConfirmed',true);
  assert.equal(interpret(capture(confirmed)).temporalEvidence.readiness,'ready');
  for (const [field,value] of [['date','2026-09-21'],['endDate','2026-09-25'],['endMode','choose'],['basisType','fixed-offset'],['timeZone','UTC'],['fixedOffset','-06:00']]) {
    assert.equal(update(confirmed,field,value).basisConfirmed,false);
  }
  assert.equal(update(confirmed,'date',confirmed.date).basisConfirmed,true);
  assert.deepEqual(capture(update(confirmed,'basisType','unknown')).temporal.captainInput.timeBasis,{});
});
test('fixed-offset and approximate facts use locked interpretation without promotion', () => {
  const r={...draft(),endMode:'next',basisType:'fixed-offset',fixedOffset:'-06:00'};
  assert.equal(interpret(capture(r)).temporalEvidence.interval,null);
  const confirmed=update(r,'basisConfirmed',true);
  assert.equal(interpret(capture(confirmed)).temporalEvidence.interval.startInstant,'2026-09-23T02:00:00Z');
  const approximate=capture({...confirmed,timesApproximate:true});
  assert.equal(approximate.temporal.captainInput.quality,'approximate');
  assert.equal(interpret(approximate).temporalEvidence.interval,null);
  assert.equal(interpret(capture({...confirmed,fixedOffset:'bad'})).temporalEvidence.interval,null);
});
test('missing and partial input preserves recorded facts without a report-validity gate', async () => {
  for (const [linesIn,linesOut] of [['',''],['08:00',''],['','16:00']]) {
    const r={...draft(),linesIn,linesOut,endMode:'choose',endDate:'2026-09-24'};
    const c=capture(r);
    assert.equal(c.temporal.captainInput.start.time,linesIn || null);
    assert.equal(c.temporal.captainInput.end.time,linesOut || null);
    assert.equal(c.temporal.captainInput.end.date,'2026-09-24');
    assert.equal(interpret(c).temporalEvidence.interval,null);
    const client=mockClient(); await insertReportWithTime(client,{},r); assert.equal(client.calls.length,1);
  }
});
test('ambiguous and nonexistent local times remain unresolved with ordinary guidance', () => {
  for (const [date,time,code] of [['2024-11-03','01:30','local-time-ambiguous'],['2024-03-10','02:30','local-time-nonexistent']]) {
    const r={...draft(),date,linesIn:time,linesOut:'06:00',endMode:'same',basisConfirmed:true};
    const t=interpret(capture(r)).temporalEvidence;
    assert.equal(t.interval,null); assert.ok(t.reasons.some(r=>r.code===code));
    assert.equal(temporalGuidance(r),'Check the recorded time and the time kept aboard. You can still save the day as recorded.');
  }
});
function mockClient(error=null) {
  const calls=[];
  return {calls,from(table){assert.equal(table,'fishing_day_reports');return {insert(payload){calls.push(payload);return {select(){return {async single(){return {data:{id:'returned-id'},error};}};}};}};}};
}
test('one atomic insert uses Task 8B projections and source-only legacy-style locations', async () => {
  const r={...draft(),endMode:'next',basisConfirmed:true,fishingLocations:[{latitude:29.5,longitude:-86.2}]};
  const client=mockClient(); const result=await insertReportWithTime(client,{captain_private:'Captain',trip_date:'wrong',fishing_locations:r.fishingLocations},r);
  assert.equal(result.id,'returned-id'); assert.equal(client.calls.length,1);
  const p=client.calls[0]; assert.deepEqual(p.evidence_capture,capture(r));
  assert.deepEqual({trip_date:p.trip_date,lines_in:p.lines_in,lines_out:p.lines_out},project(capture(r)));
  assert.equal(p.trip_date,'2026-09-22'); assert.equal(p.lines_out,'04:00');
  assert.equal(p.evidence_capture.temporal.captainInput.end.date,'2026-09-23');
  assert.deepEqual(p.fishing_locations,r.fishingLocations);
  assert.deepEqual(Object.keys(p.evidence_capture.locations[0]),['contractVersion','latitude','longitude']);
  assert.equal(p.captain_private,'Captain');
});
test('schema errors are propagated without retry or evidence loss', async () => {
  const error={message:'column evidence_capture does not exist'}; const client=mockClient(error);
  await assert.rejects(insertReportWithTime(client,{},draft()),e=>e===error);
  assert.equal(client.calls.length,1); assert.ok(client.calls[0].evidence_capture);
});
test('fresh draft resets confirmation, modes and approximation; existing required fields and close wiring remain', () => {
  const reset=createTemporalDraft(new Date(2026,8,23),'America/New_York');
  assert.equal(reset.date,'2026-09-23'); assert.equal(reset.basisConfirmed,false);
  assert.equal(reset.endMode,''); assert.equal(reset.linesIn,''); assert.equal(reset.linesOut,''); assert.equal(reset.timesApproximate,false);
  const panel=readFileSync(new URL('../../components/FishingDayReportPanel.jsx',import.meta.url),'utf8');
  for (const label of ['Captain','Boat Name','Fishing date']) assert.match(panel,new RegExp(`label="${label}"[\\s\\S]*?required`));
  assert.equal((panel.match(/\brequired\b/g)||[]).length,3);
  assert.match(panel,/setReport\(\s*createInitialReport\(\)/);
  assert.match(panel,/onMouseDown=\{onClose\}/);
  assert.match(panel,/insertReportWithTime\(supabase, reportRow, report\)/);
});

test('review: confirmation is independent of approximation and clocks, but renewed for either basis switch', () => {
  const r={...draft(),endMode:'next',basisConfirmed:true};
  for (const [field,value] of [['timesApproximate',true],['linesIn','21:00'],['linesOut','05:00']]) {
    assert.equal(update(r,field,value).basisConfirmed,true);
  }
  const fixed={...r,basisType:'fixed-offset',fixedOffset:'-06:00'};
  assert.equal(update(fixed,'basisType','iana').basisConfirmed,false);
  assert.equal(update(fixed,'fixedOffset','-05:00').basisConfirmed,false);
  const absent=createTemporalDraft(new Date(2026,8,22),'');
  assert.equal(absent.basisType,'unknown');
  assert.deepEqual(capture(absent).temporal.captainInput.timeBasis,{});
  const invalid={...r,timeZone:'Not/AZone'};
  assert.equal(interpret(capture(invalid)).temporalEvidence.interval,null);
  assert.match(temporalGuidance(invalid),/^Check the time kept aboard/);
  assert.equal(capture(invalid).temporal.captainInput.timeBasis.timeZone,'Not/AZone');
});

test('review: unresolved matrix preserves source and permits one mocked insert without readiness gating', async () => {
  const base={...draft(),endMode:'same',basisConfirmed:true,linesIn:'08:00',linesOut:'16:00'};
  const cases=[
    [{linesIn:'',linesOut:'',endMode:''},'insufficient','Time not recorded. You can save the fishing day without adding times.'],
    [{linesOut:''},'insufficient','Time not recorded. You can save the fishing day without adding times.'],
    [{linesIn:''},'insufficient','Time not recorded. You can save the fishing day without adding times.'],
    [{basisConfirmed:false},'needs-clarification','Time zone not confirmed. You can still save the day.'],
    [{endMode:'choose',endDate:'2026-09-24',linesOut:''},'insufficient','Time not recorded. You can save the fishing day without adding times.'],
    [{basisType:'fixed-offset',fixedOffset:'-06:00',basisConfirmed:false},'needs-clarification','Time zone not confirmed. You can still save the day.'],
    [{basisType:'fixed-offset',fixedOffset:'bad'},'needs-clarification','Check the time kept aboard. You can still save the day as recorded.'],
    [{linesIn:'20:00',linesOut:'04:00'},'needs-clarification','Check the ending date and recorded times.'],
    [{linesIn:'08:00',linesOut:'08:00'},'needs-clarification','Check the ending date and recorded times.'],
    [{date:'2024-11-03',linesIn:'01:30',linesOut:'06:00'},'needs-clarification','Check the recorded time and the time kept aboard. You can still save the day as recorded.'],
    [{date:'2024-03-10',linesIn:'02:30',linesOut:'06:00'},'needs-clarification','Check the recorded time and the time kept aboard. You can still save the day as recorded.']
  ];
  for (const [extra,readiness,guidance] of cases) {
    const r={...base,...extra}; const before=JSON.stringify(r); const c=capture(r);
    assert.equal(interpret(c).temporalEvidence.readiness,readiness);
    assert.equal(temporalGuidance(r),guidance);
    const client=mockClient(); await insertReportWithTime(client,{},r);
    assert.equal(client.calls.length,1); assert.deepEqual(client.calls[0].evidence_capture,c);
    assert.equal(JSON.stringify(r),before);
  }
  const overnight={...base,linesIn:'20:00',linesOut:'04:00',endMode:'next'};
  assert.equal(interpret(capture(overnight)).temporalEvidence.readiness,'ready');
  assert.equal(capture(overnight).temporal.captainInput.end.date,'2026-09-23');
});
