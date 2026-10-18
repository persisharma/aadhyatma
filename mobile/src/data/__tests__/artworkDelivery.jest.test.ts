import fs from 'node:fs';
import path from 'node:path';

// RULEBOOK §11.8: reading artwork ships from R2. These folders are publishing
// sources for the manifests; only the neutral paper is a bundled fallback.
const R2_ART = /(?:^|\/)(?:backgrounds|chalisa|gita|shiva-strotam|garud-puran|reader-illustrations|kids-stories|artwork-corrections)\/[^'"]+\.(?:webp|png|jpe?g)$/;
const ALLOWED = new Set(['@assets/backgrounds/reading-parchment-option2.webp']);
const mobile = path.join(__dirname, '../../..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' || entry.name === 'node_modules' ? [] : sourceFiles(full);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

test('no reading artwork is bundled with require(), apart from the paper fallback', () => {
  const offenders: string[] = [];
  for (const file of [...sourceFiles(path.join(mobile, 'src')), ...sourceFiles(path.join(mobile, 'assets'))]) {
    for (const [, target] of fs.readFileSync(file, 'utf8').matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      const resolved = target.startsWith('.') ? path.relative(mobile, path.resolve(path.dirname(file), target)) : target;
      if (R2_ART.test(resolved) && !ALLOWED.has(target)) offenders.push(`${path.relative(mobile, file)} → ${target}`);
    }
  }
  expect(offenders).toEqual([]);
});
