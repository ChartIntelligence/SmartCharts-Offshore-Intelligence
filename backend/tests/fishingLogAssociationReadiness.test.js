import assert from "node:assert/strict";
import {test} from "node:test";
import {buildFishingLogAssociationReadinessV1 as build} from "../../shared/fishingLogAssociationReadiness.mjs";
import {buildFishingLogTemporalEvidenceV1 as temporal} from "../../shared/fishingLogTemporalEvidence.mjs";
import {buildFishingLocationSpatialEvidenceV1 as spatial} from "../../shared/fishingLocationSpatialEvidence.mjs";

const t = (readiness = "ready") => temporal(readiness === "insufficient" ? {trip_date:"2024-11-03"} : {
  start:{date:"2024-11-03",time:readiness === "ready" ? "03:00" : "01:30"},
  end:{date:"2024-11-03",time:"06:00"},
  timeBasis:{type:"iana",confirmation:"captain-confirmed",timeZone:"America/Chicago"}
});
const s = (readiness = "ready") => spatial(readiness === "insufficient" ? {} : {
  latitude:29.5,longitude:-86.2,locationEntryId:"location-a",
  ...(readiness === "ready" ? {source:"manual",certainty:"exact-as-reported"} : {})
});
const pair = () => ({reportId:"report-a", temporalEvidence:t(), spatialEvidence:s()});

for (const tr of ["ready","needs-clarification","insufficient"]) {
  for (const sr of ["ready","needs-clarification","insufficient"]) {
    test(`${tr} + ${sr} composes without rescuing weaker evidence`, () => {
      const result = build({temporalEvidence:t(tr),spatialEvidence:s(sr)});
      const expected = [tr,sr].includes("insufficient") ? "insufficient"
        : [tr,sr].includes("needs-clarification") ? "needs-clarification" : "ready";
      assert.equal(result.assessmentReadiness,expected);
      assert.equal(result.assessmentScope,expected === "ready" ? "report-interval-at-reported-location" : null);
      assert.deepEqual(result.assessmentReasons,[["temporal",tr],["spatial",sr]]
        .filter(([,state])=>state !== "ready").map(([domain,state])=>({domain,code:`${domain}-evidence-${state}`})));
    });
  }
}

test("approved approximate and bounded evidence remain ready without quality recomputation", () => {
  for (const extra of [{certainty:"approximate"},{accuracy:{value:12,unit:"m",source:"device",kind:"horizontal-accuracy-radius"}}]) {
    const spatialEvidence = spatial({latitude:29.5,longitude:-86.2,source:"manual",...extra});
    const result = build({...pair(),spatialEvidence});
    assert.equal(result.assessmentReadiness,"ready");
    assert.equal(result.upstream.spatial.quality,spatialEvidence.quality);
  }
});

test("missing, unsupported and malformed upstream contracts fail closed", () => {
  for (const [key,domain] of [["temporalEvidence","temporal"],["spatialEvidence","spatial"]]) {
    for (const [value,code] of [[undefined,"contract-missing"],[null,"contract-missing"],
      [[],"contract-malformed"],[{...pair()[key],contractVersion:"future-v2"},"contract-version-unsupported"],
      [{...pair()[key],readiness:"invented"},"contract-malformed"],
      [{...pair()[key],original:null},"contract-malformed"],
      [{...pair()[key],reasons:[null]},"contract-malformed"]]) {
      const result = build({...pair(),[key]:value});
      assert.equal(result.assessmentReadiness,"insufficient");
      assert.equal(result.assessmentScope,null);
      assert.deepEqual(result.assessmentReasons,[{domain,code:`${domain}-${code}`}]);
    }
  }
  assert.equal(build({...pair(),temporalEvidence:{...t(),interval:null}}).assessmentReadiness,"insufficient");
  assert.equal(build({...pair(),spatialEvidence:{...s(),coordinates:null}}).assessmentReadiness,"insufficient");
  assert.equal(build({...pair(),temporalEvidence:{...t(),resolved:{}}}).assessmentReadiness,"insufficient");
  const inconsistent = t(); inconsistent.interval.startInstant = "different";
  assert.equal(build({...pair(),temporalEvidence:inconsistent}).assessmentReadiness,"insufficient");
  const badAxis = s(); badAxis.coordinates.latitude = {state:"valid",value:null};
  assert.equal(build({...pair(),spatialEvidence:badAxis}).assessmentReadiness,"insufficient");
});

test("reference identity never controls assessment or generates missing identifiers", () => {
  for (const reportId of ["report-a",null]) for (const locationEntryId of ["location-a",null]) {
    const result = build({...pair(),reportId,spatialEvidence:spatial({latitude:29.5,longitude:-86.2,
      source:"manual",certainty:"exact-as-reported",locationEntryId})});
    assert.equal(result.assessmentReadiness,"ready");
    assert.equal(result.references.reportId,reportId);
    assert.equal(result.references.locationEntryId,locationEntryId);
    assert.equal(result.persistenceReferenceReadiness,reportId && locationEntryId ? "ready" : "needs-clarification");
    assert.equal(result.persistenceReferenceReasons.length,Number(!reportId)+Number(!locationEntryId));
  }
  for (const invalidId of [undefined,"","   ",7,false,{},[]]) {
    const report = build({...pair(),reportId:invalidId});
    assert.equal(report.assessmentReadiness,"ready");
    assert.equal(report.persistenceReferenceReadiness,"needs-clarification");
    assert.equal(report.references.reportId,null);
    const location = spatial({latitude:29.5,longitude:-86.2,source:"manual",
      certainty:"exact-as-reported",locationEntryId:invalidId});
    const result = build({...pair(),spatialEvidence:location});
    assert.equal(result.assessmentReadiness,"ready");
    assert.equal(result.persistenceReferenceReadiness,"needs-clarification");
    assert.equal(result.references.locationEntryId,null);
    const malformed = build({...pair(),spatialEvidence:{...s(),locationEntryId:invalidId}});
    assert.equal(malformed.assessmentReadiness,"insufficient");
    assert.equal(malformed.persistenceReferenceReadiness,"needs-clarification");
  }
  assert.equal(build({...pair(),reportId:" report-a "}).references.reportId," report-a ");
});

test("environment compatibility is never asserted even if the caller claims a match", () => {
  const result = build({...pair(),persistenceEnvironmentCompatibility:"matched"});
  assert.equal(result.persistenceEnvironmentCompatibility,"not-evaluated");
  assert.deepEqual(result.persistenceRequirements,["requires-compatible-persistence-environment-before-association-write"]);
  assert.equal(result.persistencePrerequisiteReasons[0].code,"persistence-environment-not-evaluated");
});

test("pairwise privacy, serialization and report independence: no evidence duplication or inferred time", () => {
  const input = pair(); const before = structuredClone(input); const expected = build(input);
  assert.deepEqual(build({...input,species:"private-species",catchResults:{count:9},privateNotes:"private-note",
    reportValid:true,share_intelligence:true,arrayIndex:4,priority:2,created_at:"private-clock"}),expected);
  assert.deepEqual(input,before);
  assert.deepEqual(JSON.parse(JSON.stringify(expected)),expected);
  assert.deepEqual(build(input),expected);
  const output = JSON.stringify(expected);
  for (const raw of ["29.5","-86.2","2024-11-03","03:00","private-note","America/Chicago"]) assert.equal(output.includes(raw),false);
  assert.deepEqual(Object.keys(expected).sort(),["contractVersion","assessmentReadiness","assessmentScope",
    "upstream","assessmentReasons","references","persistenceReferenceReadiness","persistenceReferenceReasons",
    "persistenceEnvironmentCompatibility","persistencePrerequisiteReasons","persistenceRequirements"].sort());
  assert.deepEqual(Object.keys(expected.upstream.temporal).sort(),["accepted","contractVersion","quality","readiness"]);
  assert.equal(Object.hasOwn(expected,"reportValid"),false);
  const unresolved = build({...input,spatialEvidence:s("needs-clarification")});
  assert.equal(unresolved.assessmentReadiness,"needs-clarification");
  assert.deepEqual(build(input),expected,"An unresolved independent pair cannot change this pair");
});
