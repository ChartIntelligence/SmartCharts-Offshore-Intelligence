// Qualification-only composition of protected fixtures. No production selector.
export {witnessedFixture,conceptualAvailability,at,context,captureFixture} from './historicalAvailabilityReferenceFixture.mjs';
export {sourceRows,resolve} from './consumerAwareHistorySelectionFixture.mjs';
export {captureInput,encoded} from './chlorophyllTemporalDerivedFinitenessFixture.mjs';
export const sstRow=(id,h,value=84)=>({snapshot:{available:true,identity:{snapshotId:id},metadata:{time:{observedAt:new Date(Date.parse('2026-09-24T00:00:00Z')+h*3600000).toISOString()}},observation:{observations:{sst:{temperatureFahrenheit:value}}}}});
