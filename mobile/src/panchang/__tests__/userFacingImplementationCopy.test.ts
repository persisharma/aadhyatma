import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOTS = ['src/screens', 'src/components'];
const ACTIONABLE_PLATFORM_EXCEPTIONS = new Set([
  'src/components/ReadAloudSettingsSheet.tsx',
  'src/components/readAloud/ReadAloudButton.tsx',
]);

const BANNED_CUSTOMER_COPY = /\b(?:on[- ]device|offline|no (?:internet|network|account)|local notifications?|computed on device|calculation stays on this device|saved on this device|stored on this device|content review pending|review-pending corpus|namakshar-v\d+)\b|ऑफलाइन|इंटरनेट|ऑन-डिवाइस|उपकरण पर गणना|इस उपकरण पर|इस फ़ोन पर|नामाक्षर-v\d+|सामग्री समीक्षा शेष|समीक्षा-अधीन/iu;

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const file = path.join(root, name);
    if (name === '__tests__') return [];
    if (statSync(file).isDirectory()) return sourceFiles(file);
    return /\.tsx?$/.test(name) ? [file] : [];
  });
}

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('customer-facing components do not expose implementation or release-state copy', () => {
  const violations = ROOTS.flatMap(sourceFiles).flatMap((file) => {
    const normalized = file.split(path.sep).join('/');
    if (ACTIONABLE_PLATFORM_EXCEPTIONS.has(normalized)) return [];
    const match = withoutComments(readFileSync(file, 'utf8')).match(BANNED_CUSTOMER_COPY);
    return match ? [`${normalized}: ${match[0]}`] : [];
  });

  assert.deepEqual(violations, [], violations.join('\n'));
});
