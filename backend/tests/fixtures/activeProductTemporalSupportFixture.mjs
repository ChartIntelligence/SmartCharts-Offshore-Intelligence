// Qualification-only synthetic support shapes. These do not qualify a provider product.
export {frame, observation, at, context, sstQualificationView} from './temporalEvidenceFixture.mjs';
export {captureFixture} from './currentEvidenceCaptureFixture.mjs';
export const supports = [
  {kind:'instant', at:'2026-09-24T00:00:00.000Z'},
  {kind:'interval', start:'2026-09-23T00:00:00.000Z', end:'2026-09-24T00:00:00.000Z'},
  {kind:'composite-window', start:'2026-09-22T00:00:00.000Z', end:'2026-09-24T00:00:00.000Z'},
  {kind:'static'},
  {kind:'unknown', reason:'provider-support-not-established'}
];
