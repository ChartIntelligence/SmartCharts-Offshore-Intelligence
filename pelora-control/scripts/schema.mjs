import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BASELINE, ACTIONS, GOVERNANCE, CONTRACTS, TYPES } from '../dispatcher/policy.mjs';
const text = { type: 'string', minLength: 1, maxLength: 8000 };
const list = items => ({ type: 'array', uniqueItems: true, items });
const choice = values => ({ enum: values });
const scope = { type: 'string', pattern: '^[A-Za-z0-9_.\\/-]+(?:/\\*\\*)?$' };
export const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'urn:pelora:control:task:v1',
  title: 'Pelora bounded development task v1', type: 'object', additionalProperties: false,
  properties: {
    version: { const: 1 }, id: { type: 'string', pattern: '^[a-z][a-z0-9-]{1,79}$' },
    owner: text, title: text, goal: text, baseline: { const: BASELINE },
    repository: { const: 'ChartIntelligence/SmartCharts-Offshore-Intelligence' },
    worktree: { type: 'string', pattern: '^[a-z][a-z0-9-]{1,79}$' },
    branch: { type: 'string', pattern: '^codex/pelora-[a-z0-9-]+$' },
    environment: choice(['local', 'cloud']), dependencies: list(text),
    allowedFiles: list(scope), protectedFiles: list(scope), protectedContracts: list(choice(Object.keys(CONTRACTS))),
    governance: list(choice(Object.keys(GOVERNANCE))), type: choice(TYPES),
    permittedActions: list(choice(ACTIONS)), blockedActions: list(choice(ACTIONS)), requiredTests: list(text),
    commitPolicy: choice(['forbid', 'allow']), pushPolicy: choice(['forbid', 'allow']), mergePolicy: choice(['forbid', 'human']),
    approvalRequirements: list(choice(ACTIONS)), stopConditions: { ...list(text), minItems: 1 },
    expectedDisposition: choice(['COMPLETE', 'READY_FOR_INTEGRATION', 'READY_FOR_FOUNDER_QA']),
  },
  $comment: 'Runtime validator additionally enforces owner registry, path safety, mandatory governance, permissions/Git consistency, pinned queue baseline and dependency graph. A schema-valid task is not execution authorization.',
};
schema.required = Object.keys(schema.properties);
if (process.argv[1] === fileURLToPath(import.meta.url)) writeFileSync(new URL('../task.schema.json', import.meta.url), JSON.stringify(schema, null, 2) + '\n');
