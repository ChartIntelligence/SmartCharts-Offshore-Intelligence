// Reproducible offline P1 oracle and bounded affected-suite qualification; no source/DB migrations.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const baselineCommit = '234fef5203fab91df3f0132cada6d9ab7726e065';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratch = path.join(root, '.local/ocean-quarantine/cp09b-p1');
const baselineRoot = path.join(scratch, 'baseline');
fs.mkdirSync(baselineRoot, {recursive: true});
function command(executable, args, options = {}) {
  const r = spawnSync(executable, args, {cwd: root, encoding: 'utf8', windowsHide: true, timeout: 600000, maxBuffer: 24e6, ...options});
  assert.equal(r.status, 0, (r.stderr ?? '') + (r.stdout ?? ''));
  return r;
}
command('git', ['archive', '--format=zip', '--output=' + path.join(scratch, 'baseline.zip'), baselineCommit, 'backend', 'shared', 'frontend/src', 'docs']);
command('tar', ['-xf', path.join(scratch, 'baseline.zip'), '-C', baselineRoot]);
const original = fs.readFileSync(path.join(baselineRoot, 'backend/server.js'), 'utf8');
function portion(start, end, from = 0) {
  const a = original.indexOf(start, from), b = original.indexOf(end, a);
  assert(a >= 0 && b > a, 'Baseline source boundary');
  return original.slice(a, b);
}
const currentBody = portion('  const vectors =', '\n\nfunction buildCurrentOrganizationAnalysis', original.indexOf('async function getCurrentSpatialStructureAtAssessment'));
const sstBody = portion('  const samples =', '\n\nexport async function getMarineConditions', original.indexOf('async function getSstSpatialStructureAtAssessment'));
const derivedBody = portion('           const currentOrganization =', '\n  if (\n    chlorophyllResult.status', original.indexOf('async function getOceanConditionsAtAssessment'));
const centerBody = portion('    const sst = {', '\n\n\nconst oceanEvidence =', original.indexOf('async function getOceanConditionsAtAssessment'));
// Original scientific bodies retain original private dependencies in this independent module.
// Acquisition-free wrappers only expose those original blocks; they never import candidate server.js.
const oracle = original + '\n' +
  'export function buildCurrentSpatialStructureFromRetainedSamplesV1({samplePoints, results}) {\n' + currentBody + '\n' +
  'export function buildSstSpatialStructureFromRetainedSamplesV1({samplePoints, results, centerTemperatureFahrenheit, assessment}) {\n' + sstBody + '\n' +
  'export function buildCurrentDerivedFromRetainedSpatialV1(currents, currentSpatialStructure) {\n' + derivedBody.replace('currents.derived = {', 'return {') + '\n}\n' +
  'export function buildSstConditionsFromRetainedSpatialV1(marine, sstSpatial, governedEnvironmentalFeatureObservation) {\n' + centerBody + '\n  return sst;\n}\n' +
  'export function retainedSpatialSampleLayoutV1(latitude, longitude) {\n  return {sst: createSstSpatialSamplePoints(latitude, longitude), currents: createCurrentSpatialSamplePoints(latitude, longitude)};\n}\n';
fs.writeFileSync(path.join(baselineRoot, 'backend/p1Oracle.js'), oracle);
const candidate = fs.readFileSync(path.join(root, 'backend/server.js'), 'utf8');
const warningStart = sstBody.indexOf('        console.warn('), warningEnd = sstBody.indexOf('        return {', warningStart);
assert(warningStart >= 0 && warningEnd > warningStart);
const pureSst = sstBody.slice(0, warningStart) + sstBody.slice(warningEnd);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const proof = {
  baselineCommit, baselineServerSha256: sha(original), oracleSha256: sha(oracle), candidateServerSha256: sha(candidate),
  bodies: {
    current: {sha256: sha(currentBody), exact: candidate.includes(currentBody)},
    sst: {sha256: sha(pureSst), exactExceptWarningMovedToAcquisitionCaller: candidate.includes(pureSst)},
    currentDerived: {sha256: sha(derivedBody.replace('currents.derived = {', 'return {')), exactExceptAssignmentToReturn: candidate.includes(derivedBody.replace('currents.derived = {', 'return {'))},
    sstCenter: {sha256: sha(centerBody), exact: candidate.includes(centerBody)}
  },
  scope: 'Identical controlled current evidence and explicit assessment; unavailable history, not full temporal/narrative equivalence'
};
assert(Object.values(proof.bodies).every(p => Object.values(p).includes(true)), 'Scientific extraction mismatch');
fs.writeFileSync(path.join(scratch, 'oracle-proof.json'), JSON.stringify(proof, null, 2) + '\n');
console.log('Independent checkpoint oracle prepared and extraction bodies verified.');
if (process.argv.includes('--prepare-only')) process.exit(0);
const suites = [
  'retainedBlueMarlinComposition.test.mjs', 'scientificAssessment.test.js', 'archiveBoundScienceBoundary.test.js',
  'currentEvidenceCapture.test.js', 'currentEvidenceCaptureV3.test.js', 'exactScientificEvidence.test.js',
  'scalarEvidenceHandoff.test.mjs', 'scalarEvidenceHandoffAdversarial.test.mjs', 'sstChlorophyllExactReferenceBoundary.test.mjs',
  'oceanConditions.test.js', 'dynamicOpportunityFailure.test.js', 'opportunityEvaluationState.test.js',
  'bathymetryEvidence.test.js', 'publicationEnvelope.test.mjs'
];
const historyProfile = JSON.parse(fs.readFileSync(path.join(root, 'backend/tests/sourceNormalizationRegressionProfile.v1.json'), 'utf8'));
const records = [], env = {...process.env, PELORA_TEST_OCEAN_CONDITIONS: '1', PELORA_CP08_LOCAL: '1'};
for (const suite of suites) {
  const archival = historyProfile.archiveAssertions.filter(a => a.file === 'backend/tests/' + suite);
  const args = ['--test', ...(archival.length ? ['--test-skip-pattern=^(?:' + archival.map(a => RegExp.escape(a.title)).join('|') + ')$'] : []), 'backend/tests/' + suite];
  const r = spawnSync(process.execPath, args, {cwd: root, env, encoding: 'utf8', windowsHide: true, timeout: 600000, maxBuffer: 24e6});
  const log = (r.stdout ?? '') + '\n' + (r.stderr ?? '');
  fs.writeFileSync(path.join(scratch, suite + '.log'), log);
  const count = key => Number(log.match(new RegExp('(?:\\u2139|#)\\s+' + key + '\\s+(\\d+)'))?.[1] ?? 0);
  const record = {suite, command: ['node', ...args], exit: r.status, tests: count('tests'), passed: count('pass'), failed: count('fail'), skipped: count('skipped'), cancelled: count('cancelled'),
    archivalDispositions: archival.map(a => ({title: a.title, role: a.role, reason: a.reason})), explicitManualPassLines: (log.match(/^PASS\b/gm) ?? []).length, logSha256: sha(log)};
  records.push(record);fs.writeFileSync(path.join(scratch, 'affected-results.json'), JSON.stringify(records, null, 2) + '\n');
  console.log(JSON.stringify(record));
  if (r.status !== 0 || record.failed || record.cancelled) process.exit(1);
}
