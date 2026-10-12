import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GitWorkspace, git, checkHooks } from '../dispatcher/git.mjs';
test('real isolated Git provisioning, resume, commit identity, dirty state, preserved source and active-hook gate', () => {
  const root = mkdtempSync(join(tmpdir(), 'pelora-git-')), repo = join(root, 'repo'), trees = join(root, 'trees');
  mkdirSync(repo); mkdirSync(trees);
  try {
    git(repo, ['init', '-b', 'main']); git(repo, ['config', 'user.name', 'Synthetic Test']); git(repo, ['config', 'user.email', 'test@example.invalid']);
    writeFileSync(join(repo, 'AGENTS.md'), 'synthetic governance\n'); git(repo, ['add', 'AGENTS.md']); git(repo, ['commit', '-m', 'synthetic baseline']);
    const baseline = git(repo, ['rev-parse', 'HEAD']); writeFileSync(join(repo, 'unrelated.txt'), 'preserve');
    const t = { worktree: 'pelora-synthetic', branch: 'codex/pelora-synthetic', baseline, permittedActions: ['read', 'write'], allowedFiles: ['new.txt'], commitPolicy: 'allow' };
    const workspace = new GitWorkspace(repo, trees), cwd = workspace.provision(t);
    assert.equal(workspace.metadata(t).head, baseline); assert.equal(workspace.provision(t, true), cwd);
    assert.throws(() => workspace.provision(t), /existing/);
    const nestedRoot = join(repo, 'nested'); mkdirSync(nestedRoot);
    const nested = new GitWorkspace(repo, nestedRoot); assert.throws(() => nested.path(t), /nested/);
    rmSync(nestedRoot, { recursive: true });
    writeFileSync(join(cwd, 'new.txt'), 'synthetic'); assert.equal(workspace.metadata(t).clean, false);
    assert.deepEqual(workspace.metadata(t).dirtyFiles, ['new.txt']); assert.equal(workspace.provision(t, true), cwd);
    assert.throws(() => workspace.provision({ ...t, allowedFiles: [] }, true), /scope/);
    git(cwd, ['add', 'new.txt']); git(cwd, ['commit', '-m', 'synthetic candidate']);
    const m = workspace.metadata(t); assert(m.clean && m.baselineAncestor); assert.deepEqual(m.changedFiles, ['new.txt']); assert.notEqual(m.head, baseline);
    assert.equal(git(repo, ['branch', '--show-current']), 'main'); assert.equal(git(repo, ['rev-parse', 'HEAD']), baseline); assert.equal(git(repo, ['status', '--porcelain']), '?? unrelated.txt');
    assert.equal(workspace.governance(t, ['AGENTS.md'])['AGENTS.md'], 'synthetic governance');
    writeFileSync(join(repo, '.git', 'hooks', 'post-checkout'), '# never execute\n'); assert.throws(() => checkHooks(repo), /active hooks/);
    assert.throws(() => workspace.path({ worktree: '../repo' }), /escaped/);
  } finally { rmSync(root, { recursive: true }); }
});
