import {environmentalObservationV1, validateEnvironmentalObservationV1} from '../../temporalEvidencePrimitives.mjs';
import {requireScientificAssessmentV1} from '../../scientificAssessment.mjs';
import {check, freeze, cycleV3, freezeEvidenceV1, freezeScientificHistoryV1, publicationV3, hash} from '../../../shared/oceanPublication.mjs';
export const at = h => new Date(Date.parse('2026-09-24T00:00:00Z') + h * 3600000).toISOString();
export const context = h => ({contractVersion:'pelora-scientific-assessment-v1',assessmentAt:at(h)});
export const ref = id => ({kind:'captured',referenceId:id,contractVersion:'synthetic-only-v1',sha256:hash(id)});

export function frame(h=0, revision='original', value=84) {
  return {
    contractVersion:'pelora-ocean-product-frame-v1',frameId:`synthetic-sst-${h}-${revision}`,
    product:{productId:'synthetic-sst',providerId:'synthetic',datasetId:'synthetic',productVersion:revision,family:'SST',processingLevel:null,evidenceClass:'DIRECT_OBSERVATION'},
    temporal:{support:{kind:'instant',at:at(h)},observationTime:at(h),forecastIssuedAt:null,providerPublishedAt:null,acquiredAt:at(h),processedAt:null},
    spatial:{crs:'EPSG:4326',horizontalDatum:'WGS84',verticalDatum:null,coordinateOrder:'x,y',bounds:null,boundsMeaning:'unknown',nativeResolution:null,deliveredResolution:null,resamplingMethod:null,coverageCompleteness:'complete',coverageBasis:'synthetic',landMask:'explicit-cell-reasons'},
    payload:{kind:'scalar',layout:'points',coordinates:[[-90,25]],axes:null,vectorBasis:null,components:[{variableId:'sst',unit:'degF',axis:null,positiveDirection:null,values:[value],missing:[value===null?'provider-no-data':null]}]},
    quality:{providerScheme:null,flags:[],uncertainty:null},
    provenance:{sources:[{providerId:'synthetic',datasetId:'synthetic',recordId:`synthetic-${h}-${revision}`,locatorId:null,checksum:null}],adapterId:'synthetic',adapterVersion:'1',steps:[]},
    lineage:{parentFrameIds:[],sourceRecordIds:[`synthetic-${h}-${revision}`],completeness:'complete'}
  };
}
export const observation = f => environmentalObservationV1({frame:f,componentIndex:0,sampleIndex:0});

// QUALIFICATION ONLY: caller explicitly supplies qualified as-used fixtures.
// No source discovery, lookback, gap qualification, revision preference or interpolation.
export function sstQualificationView(pairs, assessment) {
  const cutoff = requireScientificAssessmentV1(assessment).assessmentAt;
  const seen = new Set(), times = new Set(), rows = [];
  let location;
  for (const pair of pairs) {
    const o = validateEnvironmentalObservationV1(pair.observation, pair.frame);
    check(o.product.family==='SST' && o.product.evidenceClass==='DIRECT_OBSERVATION');
    check(o.component.variableId==='sst' && o.component.unit==='degF');
    check(o.temporal.support.kind==='instant' && o.temporal.observationTime===o.temporal.support.at);
    check(o.temporal.observationTime<=cutoff);
    const point = JSON.stringify(o.spatial);
    if (location===undefined) location=point;
    check(location===point); // Exact synthetic sample; no new geographic tolerance.
    if (seen.has(o.observationId)) continue;
    seen.add(o.observationId);
    // Same-support competing revisions/aliases require explicit upstream choice.
    check(!times.has(o.temporal.observationTime));
    times.add(o.temporal.observationTime);
    rows.push({snapshot:{available:o.component.value!==null,identity:{snapshotId:o.observationId},
      metadata:{time:{observedAt:o.temporal.observationTime}},
      observation:{observations:{sst:{temperatureFahrenheit:o.component.value}}}}});
  }
  rows.sort((a,b)=>a.snapshot.metadata.time.observedAt.localeCompare(b.snapshot.metadata.time.observedAt));
  return freeze(rows);
}

export function publication(h=0, candidateId='synthetic-candidate') {
  const cycle=cycleV3({scheduledAt:at(h),region:{id:'synthetic-region',version:'1'},configuration:{id:'synthetic',version:'1',governanceReference:'synthetic-only',evaluatorVersion:'synthetic-explicit-assessment-history-v1',candidateUniverseVersion:'1',candidateUniverse:{reference:ref('universe'),candidateIds:[candidateId]},species:['blue-marlin'],families:['SST']}});
  const evidence=freezeEvidenceV1(cycle,[{family:'SST',status:'AVAILABLE',reason:'synthetic-qualified-fixture',reference:{...ref('synthetic-observation'),contractVersion:'pelora-environmental-evidence-sample-v1',sha256:hash(observation(frame(0)))},product:{providerId:'synthetic',productId:'synthetic-sst',evidenceClass:'DIRECT_OBSERVATION'},representedAt:at(0),support:{kind:'instant',start:null,end:null},qualification:{status:'QUALIFIED',policyReference:'synthetic-only'},admissibility:{status:'ADMISSIBLE',policyReference:'synthetic-only'},assessedAt:at(h),ageHours:h,qualityReferences:[],lineageReferences:[]}]);
  const history=freezeScientificHistoryV1(cycle,{contractVersion:'pelora-shared-scientific-history-v1',state:'AVAILABLE',asOf:at(h),reason:'synthetic-empty',sourceReference:ref('source'),entries:[]});
  return publicationV3({cycle,evidence,history,attempt:{id:'synthetic',startedAt:at(h),endedAt:at(h)},evaluation:{assessmentAt:at(h),evaluatorVersion:cycle.configuration.evaluatorVersion,evidenceSetId:evidence.evidenceSetId,historyId:history.historyId,historyState:history.state,candidateResults:[{candidateId,species:'blue-marlin',evaluationReference:ref('synthetic-result'),gate:{contractVersion:'pelora-unified-opportunity-ranking-input-v1',eligibleForRanking:false,reasons:['insufficient-evidence']},opportunityId:null,continuityReference:null,usedFamilies:['SST']}],signalReferences:[],lineageReferences:[]}});
}
