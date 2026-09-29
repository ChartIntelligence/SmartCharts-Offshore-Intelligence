// Qualification fixtures only. No selector, acquisition or persistence implementation.
export {sourceRows,resolve} from './consumerAwareHistorySelectionFixture.mjs';
export {frame,observation,at,context,sstQualificationView} from './temporalEvidenceFixture.mjs';
export const archiveIntent=(archivedAt,sourceRevision='revision-a')=>({writeId:'synthetic-write',archivedAt,storageReference:'synthetic-storage',sourceRevision,rawEvidence:[]});
