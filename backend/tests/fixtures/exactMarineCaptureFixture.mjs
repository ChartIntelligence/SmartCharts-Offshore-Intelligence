// Same-product synthetic fixtures, actual parser and unchanged quality/marine assemblers.
import {assessOceanConditions} from '../../server.js';
import {parsed,inputs,currentSupport} from './marineAssessorCompanionFixture.mjs';
import {qualityCaptureInput} from './weatherMarineQualityFixture.mjs';
import * as quality from '../../weatherMarineQualityCaptureV2.mjs';
import * as companion from '../../marineAssessorCompanionCaptureV2.mjs';
import * as current from '../../currentEvidenceCaptureV2.mjs';
export {parsed};
export const nine = [
 ['wind','speedKnots','quality','assessments/wind/values/speedKnots'],
 ['wind','gustKnots','companion','assessments/wind/values/gustKnots'],
 ['wind','directionDegrees','companion','directionalInteraction/values/windDirectionDegrees'],
 ['waves','heightFeet','quality','assessments/waves/values/heightFeet'],
 ['waves','directionDegrees','companion','directionalInteraction/values/waveDirectionDegrees'],
 ['waves','periodSeconds','companion','assessments/waves/values/periodSeconds'],
 ['swell','heightFeet','quality','assessments/swell/values/heightFeet'],
 ['swell','directionDegrees','companion','directionalInteraction/values/swellDirectionDegrees'],
 ['swell','periodSeconds','companion','assessments/swell/values/periodSeconds']];
export function prepare(m) {
  const qualityInput=qualityCaptureInput(m),q=quality.captureWeatherMarineQualityV2(qualityInput);
  const input={...inputs(m).input,qualityReference:quality.weatherMarineQualityReferenceV2(q)};
  const c=companion.captureMarineAssessorCompanionV2(input,q);
  const support=currentSupport(m),s=support.sst;
  const sst=current.captureCurrentEvidenceV2({family:s.family,sourceAuthority:s.sourceAuthority,samples:s.samples,lineageReferences:s.lineageReferences});
  const Aquality=support.quality(m),A={oceanConditions:assessOceanConditions({...m,dataQuality:Aquality})};
  const wires={quality:quality.serializeWeatherMarineQualityCaptureV2(q),companion:companion.serializeMarineAssessorCompanionV2(c,q),sst:current.serializeCurrentEvidenceCaptureV2(sst)};
  const refs={quality:quality.weatherMarineQualityReferenceV2(q),companion:companion.marineAssessorCompanionReferenceV2(c,q),sst:current.currentCaptureReferenceV2(sst)};
  const expectedNormalized=Object.fromEntries(['wind','waves','swell','source','location','observedAt','diagnostics'].map(k=>[k,structuredClone(k==='diagnostics'?{providerStatus:m.diagnostics.providerStatus}:m[k])]));
  return {qualityInput,input,q,c,sst,Aquality,A,wires,refs,support,expectedNormalized};
}
export function reconstruct(wires,refs,support) {
  const q=quality.readWeatherMarineQualityCaptureV2(wires.quality),c=companion.readMarineAssessorCompanionV2(wires.companion,q),s=current.readCurrentEvidenceCaptureV2(wires.sst);
  quality.validateWeatherMarineQualityReferenceV2(refs.quality,q);
  companion.validateMarineAssessorCompanionReferenceV2(refs.companion,c,q);
  current.validateCurrentCaptureReferenceV2(refs.sst,s);
  const r=companion.replayMarineAssessorCompanionV2(c,q),sst=current.replayCurrentEvidenceSourceV2(s).samples[0].point;
  const dataQuality=support.quality({...r,sst});
  return {r,dataQuality,B:{oceanConditions:assessOceanConditions({...r,dataQuality})}};
}
