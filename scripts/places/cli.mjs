// Explicit local inputs, stdout output only. Never downloads or modifies an active catalog.
import {readFileSync} from 'node:fs';
import {buildVerificationQueue, buildReviewedCatalog, serializePlaceArtifact} from './pipeline.mjs';
const [command, inputPath, approvalPath, ...extra] = process.argv.slice(2);
if (extra.length || !inputPath || !['queue','build'].includes(command) ||
    (command==='build' ? !approvalPath : approvalPath)) {
  throw new Error('Usage: node scripts/places/cli.mjs queue input.json | build input.json approval.json');
}
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const input = read(inputPath);
const result = command==='queue' ? buildVerificationQueue(input) : buildReviewedCatalog(input,read(approvalPath));
process.stdout.write(`${serializePlaceArtifact(result)}\n`);
