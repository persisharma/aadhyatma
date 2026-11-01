import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const policyPath = 'docs/engineering/vedansh-build-checklist.md';
const entryPoints = [
  'AGENTS.md',
  'CLAUDE.md',
  '.claude/rules/vedansh-build-guardrails.md',
  '.github/copilot-instructions.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'RULEBOOK.md',
  'wiki/index.md',
];

export function verifyAgentInstructions(root) {
  const errors = [];
  function read(path) {
    try { return readFileSync(resolve(root, path), 'utf8'); }
    catch { errors.push('Missing instruction file: ' + path); return ''; }
  }
  const policy = read(policyPath);
  for (const [prefix, count] of [['U', 12], ['C', 10]]) {
    for (let index = 1; index <= count; index++) {
      const marker = '### ' + prefix + index + '.';
      if (!policy.split('\n').some(line => line.startsWith(marker + ' '))) {
        errors.push('Missing checklist group: ' + prefix + index);
      }
    }
  }
  for (const status of ['PASS', 'FAIL', 'PENDING', 'N/A']) {
    if (!policy.includes(status)) errors.push('Missing evidence status: ' + status);
  }
  if (!policy.includes('before cleanup') || !policy.includes('remote branch')) {
    errors.push('Policy must preserve work remotely before cleanup');
  }
  for (const path of entryPoints) {
    const text = read(path);
    if (!text.includes(policyPath) && !text.includes('vedansh-build-checklist.md')) {
      errors.push('Instruction entry point does not link to policy: ' + path);
    }
    // Resolve each local Markdown link naming this policy from its own directory.
    for (const match of text.matchAll(/\]\(([^)\s]+vedansh-build-checklist\.md)(?:#[^)]*)?\)/g)) {
      const target = match[1];
      if (!/^[a-z]+:\/\//i.test(target) &&
          resolve(root, dirname(path), target) !== resolve(root, policyPath)) {
        errors.push('Broken policy link in ' + path + ': ' + target);
      }
    }
  }
  const claude = read('CLAUDE.md');
  if (!/^@AGENTS\.md\s*$/m.test(claude)) errors.push('CLAUDE.md must import AGENTS.md');
  const rule = read('.claude/rules/vedansh-build-guardrails.md');
  if (rule.startsWith('---\n')) errors.push('Shared Claude rule must remain unscoped');
  const template = read('.github/PULL_REQUEST_TEMPLATE.md');
  for (let index = 1; index <= 12; index++) {
    if (!template.includes('| U' + index + ' ')) errors.push('PR template omits U' + index);
  }
  return [...new Set(errors)];
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const errors = verifyAgentInstructions(root);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Agent instruction entry points, policy groups, links and evidence template: PASS');
  }
}
