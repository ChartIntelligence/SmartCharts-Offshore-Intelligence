import assert from "node:assert/strict";
import {test} from "node:test";
import {FISHING_LOG_EVIDENCE_CAPTURE_CONTRACT as VERSION,
  buildFishingLogEvidenceCaptureV1 as build, normalizeFishingLogEvidenceV1 as read,
  projectFishingLogLegacyFieldsV1 as project, interpretFishingLogEvidenceCaptureV1 as interpret
} from "../../shared/fishingLogEvidenceCapture.mjs";
import {buildFishingLogTemporalEvidenceV1 as temporal} from "../../shared/fishingLogTemporalEvidence.mjs";
import {buildFishingLocationSpatialEvidenceV1 as spatial} from "../../shared/fishingLocationSpatialEvidence.mjs";
import {buildFishingLogAssociationReadinessV1 as association} from "../../shared/fishingLogAssociationReadiness.mjs";

const time = () => ({start:{date:"2026-09-22",time:"08:00"},end:{date:"2026-09-22",time:"16:00"},
  quality:"bounded",timeBasis:{type:"iana",timeZone:"America/Chicago",confirmation:"captain-confirmed"}});
const location = () => ({locationEntryId:"entry-a",latitude:29.5,longitude:-86.2,
  label:"  Recorded position  ",source:"manual",certainty:"exact-as-reported"});
const accuracy = () => ({value:12,unit:"m",source:"explicit-device-observation",kind:"horizontal-accuracy-radius"});
const wire = value => JSON.parse(JSON.stringify(value));

test("same-day capture preserves facts while explicit interpretation delegates to Task 7B", () => {
  const input = time(); const capture = build({temporal:input});
  assert.equal(capture.contractVersion,VERSION);
  assert.deepEqual(capture.temporal.captainInput,input);
  assert.deepEqual(project(capture),{trip_date:"2026-09-22",lines_in:"08:00",lines_out:"16:00"});
  assert.deepEqual(interpret(capture).temporalEvidence,temporal(input));
  assert.equal(interpret(capture).temporalEvidence.interval.startInstant,"2026-09-22T13:00:00Z");
  assert.equal(capture.temporal.captainInput.start.time,"08:00");
  assert.deepEqual(Object.keys(capture.temporal),["captainInput"]);
});

for (const endDate of ["2026-09-23","2026-09-25"]) test(`explicit end date ${endDate} preserves overnight/multi-day meaning`, () => {
  const input = time(); input.start.time="20:00"; input.end={date:endDate,time:"04:00"};
  const capture = build({temporal:input});
  assert.equal(interpret(capture).temporalEvidence.readiness,"ready");
  assert.deepEqual(project(capture),{trip_date:"2026-09-22",lines_in:"20:00",lines_out:"04:00"});
  assert.equal(read({captureEvidence:wire(capture)}).capture.temporal.captainInput.end.date,endDate);
  const legacy = read(project(capture));
  assert.equal(legacy.state,"legacy");
  const evaluated = temporal(legacy.legacyFacts);
  assert.equal(evaluated.original.end.date,null);
  assert.equal(evaluated.interval,null);
  assert.equal(evaluated.original.timeBasis.timeZone,null);
});

test("unknown/suggested basis, approximation and fixed offset retain upstream meanings", () => {
  for (const basis of [{},{type:"iana",timeZone:"America/Chicago",confirmation:"suggested"}]) {
    const input={...time(),timeBasis:basis}; const capture=build({temporal:input});
    assert.deepEqual(capture.temporal.captainInput.timeBasis,basis);
    assert.equal(interpret(capture).temporalEvidence.interval,null);
  }
  const approximate={...time(),quality:"approximate"};
  const a=interpret(build({temporal:approximate})).temporalEvidence;
  assert.equal(a.quality,"approximate"); assert.equal(a.interval,null); assert.equal(a.resolved.start,null);
  const fixed={...time(),timeBasis:{type:"fixed-offset",offset:"-06:00",confirmation:"captain-confirmed"}};
  const f=interpret(build({temporal:fixed})).temporalEvidence;
  assert.deepEqual(f,temporal(fixed)); assert.equal(f.interval.startInstant,"2026-09-22T14:00:00Z");
});

test("DST ambiguity and missing end date are never repaired by capture", () => {
  const input=time(); input.start={date:"2024-11-03",time:"01:30"}; input.end={date:"2024-11-03",time:"06:00"};
  assert.equal(interpret(build({temporal:input})).temporalEvidence.readiness,"needs-clarification");
  delete input.end.date;
  const capture=build({temporal:input});
  assert.equal(Object.hasOwn(capture.temporal.captainInput.end,"date"),false);
  assert.equal(interpret(capture).temporalEvidence.readiness,"insufficient");
});

test("manual, approximate, unknown and bounded locations use Task 7C exclusively", () => {
  for (const extra of [{},{source:"map-selection"},{source:"unknown"},{certainty:"approximate"},{certainty:"unknown"},
    {accuracy:accuracy()},{certainty:"approximate",accuracy:accuracy()},
    {source:"device-capture",certainty:"unknown",accuracy:accuracy()}]) {
    const input={...location(),...extra}; const capture=build({locations:[input]});
    assert.deepEqual(interpret(capture).spatialEvidence[0],spatial(input));
    assert.equal(capture.locations[0].label,input.label);
    assert.equal(capture.locations[0].certainty,input.certainty);
    assert.equal(capture.locations[0].contractVersion,VERSION);
  }
  const a=interpret(build({locations:[{...location(),certainty:"approximate",accuracy:accuracy()}]})).spatialEvidence[0];
  assert.equal(a.quality,"approximate"); assert.equal(a.readiness,"ready");
  assert.equal(Object.hasOwn(build({locations:[location()]}).locations[0],"accuracy"),false);
});

test("explicit accuracy including malformed values cannot contaminate valid coordinates", () => {
  for (const a of [accuracy(),{...accuracy(),representation:"unrelated"},{...accuracy(),value:0},{...accuracy(),value:NaN},
    {...accuracy(),unit:"feet"},null,[],"bad",{}, {value:12}]) {
    const input={...location(),accuracy:a}; const capture=wire(build({locations:[input]}));
    const result=interpret(capture).spatialEvidence[0];
    assert.equal(result.coordinates.validity,"valid");
    assert.deepEqual(result.accuracy,spatial(input).accuracy);
    assert.equal(result.readiness,spatial(input).readiness);
  }
});

test("invalid scalar representations survive serialization without becoming coordinate evidence", () => {
  for (const value of [null,undefined,"", "29.5",false,[],{},NaN,Infinity,-Infinity]) {
    const capture=wire(build({locations:[{...location(),latitude:value}]}));
    assert.equal(read({captureEvidence:capture}).state,"supported");
    const result=interpret(capture).spatialEvidence[0];
    assert.equal(result.coordinates.validity,"insufficient");
    assert.equal(result.coordinates.latitude.value,null);
    assert.equal(result.coordinates.latitude.state,spatial({...location(),latitude:value}).coordinates.latitude.state);
  }
  for (const latitude of [0,-0,90,-90]) {
    const capture=wire(build({locations:[{...location(),latitude,longitude:180}]}));
    assert.equal(interpret(capture).spatialEvidence[0].coordinates.validity,"valid");
    assert.equal(interpret(capture).spatialEvidence[0].coordinates.longitude.value,180);
  }
});

test("IDs, duplicates and order survive unchanged without generating route or identity", () => {
  const entries=[location(),{...location(),locationEntryId:"entry-b"},{latitude:29.5,longitude:-86.2}];
  const capture=build({locations:entries});
  assert.deepEqual(capture.locations.map(l=>l.locationEntryId),["entry-a","entry-b",undefined]);
  assert.equal(Object.hasOwn(capture.locations[2],"locationEntryId"),false);
  assert.deepEqual(interpret(capture).spatialEvidence[2],spatial(entries[2]));
  assert.equal(interpret(capture).spatialEvidence[2].quality,"unknown");
  assert.equal(interpret(capture).spatialEvidence[2].readiness,"needs-clarification");
  assert.deepEqual(Object.keys(capture.locations[2]),["contractVersion","latitude","longitude"]);
});

test("legacy reads preserve facts only, without promotion, mutation or evaluation", () => {
  const input={trip_date:"2026-09-22",lines_in:"20:00",lines_out:"04:00",fishing_locations:[{latitude:29.5,longitude:-86.2}]};
  const before=wire(input); const result=read(input);
  assert.deepEqual(result,{state:"legacy",capture:null,legacyFacts:input});
  assert.deepEqual(input,before);
  const l=result.legacyFacts.fishing_locations[0];
  assert.deepEqual(Object.keys(l),["latitude","longitude"]);
  assert.equal(spatial(l).source,"unknown"); assert.equal(spatial(l).certainty,"unknown");
  assert.equal(spatial(l).accuracy.state,"unknown"); assert.equal(spatial(l).locationEntryId,null);
});

test("new capture round trip is exact, detached and does not consult legacy projections", () => {
  const capture=build({temporal:time(),locations:[location()]});
  const result=read({captureEvidence:wire(capture),trip_date:"1900-01-01"});
  assert.deepEqual(result.capture,capture); assert.equal(result.legacyFacts,null);
  assert.notEqual(result.capture,capture);
  assert.deepEqual(interpret(result.capture),interpret(capture));
  result.capture.locations[0].label="changed";
  assert.equal(capture.locations[0].label,"  Recorded position  ");
});

test("unsupported and malformed wire contracts fail safely including per-location versions", () => {
  for (const change of [c=>{c.contractVersion="future";},c=>{c.locations[0].contractVersion="future";},
    c=>{c.temporal=null;},c=>{c.temporal.derivedInterpretation={readiness:"ready"};},
    c=>{c.locations[0].latitude={representation:"number",value:"29.5"};}]) {
    const capture=build({temporal:time(),locations:[location()]}); change(capture);
    const result=read({captureEvidence:capture,trip_date:"2026-09-22",fishing_locations:[location()]});
    assert.equal(result.capture,null);
    assert.deepEqual(result.legacyFacts.fishing_locations,[{latitude:29.5,longitude:-86.2}]);
    assert.equal(project(capture),null);
    assert.equal(interpret(capture).temporalEvidence,null);
    assert.deepEqual(interpret(capture).spatialEvidence,[]);
  }
});

test("Task 7D stays ephemeral and report identity is not needed to capture evidence", () => {
  const capture=build({temporal:time(),locations:[location()]}); const evaluated=interpret(capture);
  const preview=association({temporalEvidence:evaluated.temporalEvidence,spatialEvidence:evaluated.spatialEvidence[0]});
  assert.equal(preview.assessmentReadiness,"ready");
  assert.equal(preview.persistenceReferenceReadiness,"needs-clarification");
  assert.equal(preview.references.reportId,null);
  assert.equal(preview.persistenceEnvironmentCompatibility,"not-evaluated");
  assert.deepEqual(Object.keys(capture),["contractVersion","temporal","locations"]);
});

test("minimal output ignores unrelated private, device, outcome and matching inputs", () => {
  const clean={temporal:time(),locations:[location()]};
  const noisy={...clean,reportId:"private",user_id:"private",notes_private:"private",species_results:{private:1},
    catches:2,timezone:"device",currentTime:"now",distance:12,associationReadiness:"ready",
    locations:[{...location(),visitTime:"now",captureRecordedAt:"now",routeOrder:1,privateNotes:"private"}]};
  assert.deepEqual(build(noisy),build(clean));
  assert.equal(JSON.stringify(build(noisy)).includes("private"),false);
  assert.equal(JSON.stringify(build(noisy)),JSON.stringify(build(noisy)));
  assert.deepEqual(build(),{contractVersion:VERSION,temporal:{captainInput:{}},locations:[]});
  assert.deepEqual(project(build()),{trip_date:null,lines_in:null,lines_out:null});
  assert.equal(interpret(build()).temporalEvidence.readiness,"insufficient");
  assert.equal(Object.hasOwn(build(),"reportValid"),false);
});

test("omitted quality and explicit invalid quality stay distinct; no approximation is inferred", () => {
  const input=time(); delete input.quality;
  const capture=build({temporal:input});
  assert.equal(Object.hasOwn(capture.temporal.captainInput,"quality"),false);
  assert.deepEqual(interpret(capture).temporalEvidence,temporal(input));
  const invalid=build({temporal:{...input,quality:null}});
  assert.equal(invalid.temporal.captainInput.quality,null);
  assert.equal(interpret(invalid).temporalEvidence.interval,null);
});

test("review matrix: all six temporal capture forms round trip without derived source fields", () => {
  const inputs=[time(),
    {...time(),start:{date:"2026-09-22",time:"20:00"},end:{date:"2026-09-23",time:"04:00"}},
    {...time(),end:{date:"2026-09-25",time:"04:00"}},
    {...time(),timeBasis:{type:"fixed-offset",offset:"-06:00",confirmation:"captain-confirmed"}},
    {...time(),quality:"approximate"},
    {...time(),timeBasis:{type:"iana",timeZone:"America/Chicago",confirmation:"suggested"}}];
  for (const input of inputs) {
    const capture=build({temporal:input}); const serialized=JSON.stringify(capture);
    const normalized=read({captureEvidence:wire(capture)});
    assert.equal(normalized.state,"supported");
    assert.deepEqual(normalized.capture.temporal,{captainInput:input});
    assert.equal(JSON.stringify(normalized.capture),serialized);
    const derived=interpret(normalized.capture);
    assert.deepEqual(derived.temporalEvidence,temporal(input));
    assert.equal(JSON.stringify(normalized.capture),serialized,"interpretation cannot replace/mutate source");
    assert.deepEqual(Object.keys(normalized.capture),["contractVersion","temporal","locations"]);
  }
});

test("review matrix: enriched location facts and absent fields survive a complete read round trip", () => {
  const entries=[location(),{...location(),certainty:"approximate"},
    {...location(),certainty:"unknown"},{latitude:0,longitude:0},
    {...location(),label:""},{...location(),accuracy:accuracy()},
    {...location(),accuracy:{value:"bad",unit:"m",source:"captain",kind:"horizontal-accuracy-radius"}},
    {...location(),locationEntryId:"entry-b"}];
  const result=read({captureEvidence:wire(build({locations:entries}))});
  assert.equal(result.state,"supported");
  assert.deepEqual(result.capture.locations,entries.map(entry=>({contractVersion:VERSION,...entry})));
  const original=JSON.stringify(result.capture);
  assert.deepEqual(interpret(result.capture).spatialEvidence,entries.map(spatial));
  assert.equal(JSON.stringify(result.capture),original);
  assert.equal(Object.hasOwn(result.capture.locations[3],"locationEntryId"),false);
  assert.equal(Object.hasOwn(result.capture.locations[3],"accuracy"),false);
  for (const latitude of [-91,91]) {
    const evaluated=interpret(read({captureEvidence:wire(build({locations:[{...location(),latitude}]}))}).capture);
    assert.equal(evaluated.spatialEvidence[0].coordinates.latitude.state,"out-of-range");
    assert.equal(evaluated.spatialEvidence[0].readiness,"insufficient");
  }
});

test("review matrix: malformed versions and location envelopes never authorize familiar fields", () => {
  const fallback={trip_date:"2026-09-22",lines_in:"20:00",lines_out:"04:00",
    fishing_locations:[{latitude:29.5,longitude:-86.2}]};
  for (const version of [undefined,null,1,{},[],"", "future-v2"]) {
    const capture=build({temporal:time(),locations:[location()]}); capture.contractVersion=version;
    const result=read({...fallback,captureEvidence:wire(capture)});
    assert.equal(result.state,"unsupported"); assert.equal(result.capture,null);
    assert.deepEqual(result.legacyFacts,fallback);
    assert.deepEqual(interpret(wire(capture)),{state:"unsupported",temporalEvidence:null,spatialEvidence:[]});
  }
  for (const entry of [null,[],{contractVersion:VERSION,latitude:[],longitude:-86.2}]) {
    const capture=build({temporal:time()}); capture.locations=[entry];
    const result=read({...fallback,captureEvidence:capture});
    assert.equal(result.state,"malformed"); assert.equal(result.capture,null);
    assert.deepEqual(result.legacyFacts,fallback);
    assert.deepEqual(interpret(capture),{state:"malformed",temporalEvidence:null,spatialEvidence:[]});
  }
});
