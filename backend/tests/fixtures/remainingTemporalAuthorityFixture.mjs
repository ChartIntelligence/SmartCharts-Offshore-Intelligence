// Synthetic identity/provenance probes. No history selection or temporal arithmetic.
export {probe,inputFor,frame,observation,at,context,witnessedFixture,conceptualAvailability} from './sstChlorophyllTemporalSupportFixture.mjs';
export {ref} from './currentEvidenceCaptureFixture.mjs';
export {captureCurrentEvidenceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2} from '../../currentEvidenceCaptureV2.mjs';
export const syntheticSst = (value=25) => ({time:'2026-09-24T12:00:00Z',sea_surface_temperature:value});
