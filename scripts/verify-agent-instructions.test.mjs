import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { verifyAgentInstructions } from './verify-agent-instructions.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paths = [
  'AGENTS.md', 'CLAUDE.md', 'RULEBOOK.md', 'wiki/index.md',
  '.claude/rules/vedansh-build-guardrails.md', '.github/copilot-instructions.md',
  '.github/PULL_REQUEST_TEMPLATE.md', 'docs/engineering/vedansh-build-checklist.md',
];
function fixture(run) {
  const root = mkdtempSync(resolve(tmpdir(), 'vedansh-instructions-'));
  try {
    for (const path of paths) {
      mkdirSync(dirname(resolve(root, path)), { recursive: true });
      writeFileSync(resolve(root, path), readFileSync(resolve(repo, path)));
    }
    run(root);
  } finally { rmSync(root, { recursive: true, force: true }); }
}
function replace(root, path, from, to) {
  const file = resolve(root, path);
  const text = readFileSync(file, 'utf8');
  assert.ok(text.includes(from), 'fixture replacement must match');
  writeFileSync(file, text.replace(from, to));
}

test('current instruction graph and all checklist groups are reachable', () => {
  assert.deepEqual(verifyAgentInstructions(repo), []);
});
test('missing assistant entry point fails', () => fixture(root => {
  rmSync(resolve(root, '.github/copilot-instructions.md'));
  assert.ok(verifyAgentInstructions(root).some(error => error.includes('Missing instruction file')));
}));
test('a wrong relative policy link fails even when the filename matches', () => fixture(root => {
  replace(root, 'AGENTS.md', '(docs/engineering/', '(missing/docs/engineering/');
  assert.ok(verifyAgentInstructions(root).some(error => error.includes('Broken policy link')));
}));
test('losing Claude import fails', () => fixture(root => {
  replace(root, 'CLAUDE.md', '@AGENTS.md', 'AGENTS.md');
  assert.ok(verifyAgentInstructions(root).some(error => error.includes('must import')));
}));
test('losing a conditional checklist group fails', () => fixture(root => {
  replace(root, 'docs/engineering/vedansh-build-checklist.md', '### C4.', '### Removed.');
  assert.ok(verifyAgentInstructions(root).includes('Missing checklist group: C4'));
}));
test('scoping the shared Claude rule fails', () => fixture(root => {
  const path = '.claude/rules/vedansh-build-guardrails.md';
  writeFileSync(resolve(root, path), '---\npaths: ["mobile/**"]\n---\n' + readFileSync(resolve(root, path), 'utf8'));
  assert.ok(verifyAgentInstructions(root).some(error => error.includes('unscoped')));
}));
test('omitting a PR evidence row fails', () => fixture(root => {
  replace(root, '.github/PULL_REQUEST_TEMPLATE.md', '| U12 ', '| Removed ');
  assert.ok(verifyAgentInstructions(root).includes('PR template omits U12'));
}));
