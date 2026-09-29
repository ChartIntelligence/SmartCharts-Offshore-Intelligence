// Qualification cases only; no selector, history adapter or runtime cutoff implementation.
export {sourceRows,resolve} from './consumerAwareHistorySelectionFixture.mjs';
export {frame,observation,sstQualificationView,publication,at,context} from './temporalEvidenceFixture.mjs';
export {encoded} from './chlorophyllTemporalDerivedFinitenessFixture.mjs';
export const cutoffCases=Object.freeze([
 {name:'before',start:'2026-09-23T00:00:00Z',end:'2026-09-23T12:00:00Z',entireSupportNotFuture:true},
 {name:'ends-at-assessment',start:'2026-09-23T12:00:00Z',end:'2026-09-24T00:00:00Z',entireSupportNotFuture:true},
 {name:'straddles',start:'2026-09-23T12:00:00Z',end:'2026-09-24T12:00:00Z',entireSupportNotFuture:false},
 {name:'starts-after',start:'2026-09-24T01:00:00Z',end:'2026-09-24T12:00:00Z',entireSupportNotFuture:false}
]);
