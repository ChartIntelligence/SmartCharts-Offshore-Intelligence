// Explicit local review command only. Never imported by the production app/server.
import {createServer} from '../../frontend/node_modules/vite/dist/node/index.js';
import react from '../../frontend/node_modules/@vitejs/plugin-react/dist/index.js';
import {fileURLToPath} from 'node:url';
import {writeOceanArchiveV1} from '../../shared/oceanProductArchive.mjs';
import {createSyntheticScalarRuntimeV1} from '../../backend/fields/scalarRuntime.js';
import {syntheticScalarFrame} from '../../backend/tests/fixtures/syntheticScalarFrame.js';
const records = new Map();
const port = {createIfAbsent: async (id, record) => {
  const outcome = records.has(id) ? 'exists' : 'created';
  if (!records.has(id)) records.set(id, structuredClone(record));
  return {outcome, durable: true, record: records.get(id)}; // simulated acknowledgement, not durable production storage
}, readExact: async id => records.has(id) ? {status: 'found', durable: true, record: records.get(id)} : {status: 'not-found'}};
const archived = await writeOceanArchiveV1(port, syntheticScalarFrame(), {writeId: 'synthetic-write', archivedAt: '2026-09-03T00:00:00Z', storageReference: 'synthetic-memory', sourceRevision: 'synthetic-revision-1', rawEvidence: []});
if (archived.status !== 'ARCHIVED') throw Error('Review archive failed');
const runtime = createSyntheticScalarRuntimeV1({port,
  selection: {selector: 'synthetic-day-v1', layer: 'synthetic-sst', variableId: 'temperature', archiveId: archived.receipt.archiveId, receiptDigest: archived.receipt.receiptDigest},
  limits: {maxSourceBytes: 30000, maxSourceCells: 6, maxCells: 6, maxPayloadBytes: 20000, maxHttpBytes: 22000}, generatedAt: '2026-09-03T01:00:00Z'});
const root = fileURLToPath(new URL('.', import.meta.url));
const server = await createServer({configFile: false, envDir: false, root, plugins: [react(), {name: 'synthetic-review-only', configureServer(s) {
  s.middlewares.use('/review-api/scalar', async (req, res) => {
    const controller = new AbortController(); const cancel = () => controller.abort(); res.once('close', cancel);
    try {
      const result = await runtime(new URL(req.url, 'http://localhost').searchParams, controller.signal);
      res.writeHead(result.statusCode, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}); res.end(JSON.stringify(result.body));
    } finally { res.off('close', cancel); }
  });
}}], resolve: {dedupe: ['react', 'react-dom'], alias: {
  react: fileURLToPath(new URL('../../frontend/node_modules/react', import.meta.url)),
  'react-dom': fileURLToPath(new URL('../../frontend/node_modules/react-dom', import.meta.url)),
}}, server: {host: '127.0.0.1', port: 5188, strictPort: true, fs: {allow: [fileURLToPath(new URL('../..', import.meta.url))]}},
  cacheDir: fileURLToPath(new URL('../../frontend/node_modules/.vite-sst-review', import.meta.url))});
await server.listen(); console.log('SYNTHETIC SST REVIEW ONLY: http://127.0.0.1:5188');
