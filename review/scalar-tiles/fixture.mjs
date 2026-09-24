// Review-only, simulated atomic archive. Never imported by production code.
import {writeOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {createSyntheticScalarRuntimeV1} from '../../backend/fields/scalarRuntime.js';
import {syntheticScalarFrame} from '../../backend/tests/fixtures/syntheticScalarFrame.js';
import {parseSyntheticSstResponse} from '../../frontend/src/utils/syntheticSstDisplay.js';
export async function governedFixture() {
  const records = new Map();
  const port = {
    async createIfAbsent(id, record) {
      const outcome = records.has(id) ? 'exists' : 'created';
      if (!records.has(id)) records.set(id, structuredClone(record));
      return {outcome, durable: true, record: records.get(id)}; // simulated acknowledgement only
    },
    async readExact(id) { return records.has(id) ? {status: 'found', durable: true, record: records.get(id)} : {status: 'not-found'}; },
  };
  const archived = await writeOceanArchiveV1(port, syntheticScalarFrame(), {writeId: 'synthetic-write', archivedAt: '2026-09-03T00:00:00Z', storageReference: 'synthetic-memory', sourceRevision: 'synthetic-revision-1', rawEvidence: []});
  if (archived.status !== 'ARCHIVED') throw Error('Synthetic archive failed');
  const runtime = createSyntheticScalarRuntimeV1({port,
    selection: {selector: 'synthetic-day-v1', layer: 'synthetic-sst', variableId: 'temperature', archiveId: archived.receipt.archiveId, receiptDigest: archived.receipt.receiptDigest},
    limits: {maxSourceBytes: 30000, maxSourceCells: 6, maxCells: 6, maxPayloadBytes: 20000, maxHttpBytes: 22000}, generatedAt: '2026-09-03T01:00:00Z'});
  const result = await runtime(new URLSearchParams({mode: 'scalar', layer: 'synthetic-sst', evidence: 'synthetic-day-v1', component: 'temperature', bbox: '-90,25,-86,27', strideX: '1', strideY: '1'}));
  return parseSyntheticSstResponse(result.body);
}
