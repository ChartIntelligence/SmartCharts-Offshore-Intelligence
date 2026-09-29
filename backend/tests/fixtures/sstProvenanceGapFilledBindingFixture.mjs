// Qualification-only identity probes; no retrieval, selector or temporal arithmetic.
import {buildObservationSnapshot,buildIntelligenceSnapshot,buildSnapshotMetadata,buildOceanSnapshot,buildOceanMemoryStorageRecordFromRow} from '../../server.js';
export {probe,inputFor,syntheticSst,captureCurrentEvidenceV2,currentCaptureReferenceV2,validateCurrentCaptureReferenceV2,ref,at,context,witnessedFixture,conceptualAvailability} from './remainingTemporalAuthorityFixture.mjs';
export function historicalSnapshot(point){
  const observedAt=point.observedAt,generatedAt='2026-09-24T14:00:00Z';
  const observationSnapshot=buildObservationSnapshot({location:{latitude:25,longitude:-90},observedAt,generatedAt,observations:{sst:point},oceanEvidence:{groups:{}}});
  const intelligenceSnapshot=buildIntelligenceSnapshot({observedAt,generatedAt,oceanOpportunity:{available:false}});
  const snapshotMetadata=buildSnapshotMetadata({observationSnapshot,intelligenceSnapshot});
  return buildOceanSnapshot({snapshotMetadata,observationSnapshot,intelligenceSnapshot});
}
export function adapt(snapshot){
  return buildOceanMemoryStorageRecordFromRow({row:{snapshot_id:snapshot.identity.snapshotId,user_id:'synthetic-owner',observed_at:snapshot.metadata.time.observedAt,created_at:snapshot.metadata.time.generatedAt,latitude:25,longitude:-90,snapshot_schema_version:snapshot.identity.snapshotSchemaVersion,snapshot_contract_version:snapshot.contractVersion,snapshot_payload:snapshot}});
}
