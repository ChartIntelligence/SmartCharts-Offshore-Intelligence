// Synthetic storage-transport responses through unchanged production boundaries.
// No database, provider, Auth service, selector implementation or full Ocean Physics call.
import assert from 'node:assert/strict';
import {endpoints,leaves,consumers} from './chlorophyllTemporalDerivedFinitenessFixture.mjs';
import {buildObservationSnapshot,buildIntelligenceSnapshot,buildSnapshotMetadata,buildOceanSnapshot,retrieveOceanMemoryRows,buildOceanMemoryStorageRecordFromRow,buildHistoricalSnapshotQuery,buildOceanMemoryTimeSeries} from '../../server.js';
export {consumers};
export async function sourceRows(t,family='direct',values=[1e308,-1e308]){
 const points=await endpoints(t,family,values);
 const rows=points.map(point=>{
  const observedAt=point.observedAt,generatedAt='2026-09-24T01:00:00Z';
  const observationSnapshot=buildObservationSnapshot({location:{latitude:25,longitude:-90},observedAt,generatedAt,observations:{chlorophyll:point},oceanEvidence:{groups:{productivity:leaves.buildProductivityEvidence(point),clarity:leaves.buildClarityEvidence(point)}}});
  // Minimal documentary intelligence input. No species/scoring/physics derivation asserted.
  const intelligenceSnapshot=buildIntelligenceSnapshot({observedAt,generatedAt,oceanOpportunity:{available:false}});
  const snapshotMetadata=buildSnapshotMetadata({observationSnapshot,intelligenceSnapshot});
  const snapshot=buildOceanSnapshot({snapshotMetadata,observationSnapshot,intelligenceSnapshot});
  assert(snapshot.available);
  return {snapshot_id:snapshot.identity.snapshotId,user_id:'synthetic-owner',observed_at:observedAt,created_at:generatedAt,latitude:25,longitude:-90,snapshot_schema_version:snapshot.identity.snapshotSchemaVersion,snapshot_contract_version:snapshot.contractVersion,snapshot_payload:snapshot};
 });return {points,rows};
}
export async function resolve(rows,{bearerToken='synthetic-token'}={}){
 let query=null,transportCalls=0;
 const retrieval=await retrieveOceanMemoryRows({configuration:{available:true,restUrl:'https://synthetic.invalid/rest/v1',credentials:{publishableKey:'synthetic-key'}},bearerToken,latitude:25,longitude:-90,maximumRows:48,fetchImplementation:async url=>{transportCalls++;query=String(url);return {ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(rows))};}});
 const adapted=retrieval.rows.map(row=>buildOceanMemoryStorageRecordFromRow({row})).filter(r=>r.available===true);
 const selected=buildHistoricalSnapshotQuery({historicalSnapshots:adapted});
 const series=buildOceanMemoryTimeSeries({historicalSnapshots:selected.historicalSnapshots});
 const results=Object.fromEntries(Object.entries(consumers).map(([kind,fn])=>[kind,fn({historicalSnapshots:series.historicalSnapshots})]));
 return {query,transportCalls,retrieval,adapted,selected,series,results};
}
