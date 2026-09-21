import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const EXTRA_FILES = ['src/ask/intents/prashnaResolve.ts'];
const ROOTS = ['src/screens', 'src/components'];
const ACTIONABLE_PLATFORM_EXCEPTIONS = new Set([
  'src/components/ReadAloudSettingsSheet.tsx',
  'src/components/readAloud/ReadAloudButton.tsx',
]);

// This hardware limitation tells the user how to continue without a compass.
const ACTIONABLE_COPY_EXCEPTIONS: Record<string, string> = {
  'src/screens/VastuDishaScreen.tsx': 'No compass sensor on this device — choose a direction below.',
};

const BANNED_CUSTOMER_COPY = /\b(?:on[- ]device|on (?:this|that|your) (?:device|phone)|no cloud|no server|first interpretation model|source[- ]review|source review of the rules|offline|no (?:internet|network|account)|local notifications?|computed on device|calculation stays on this device|saved on this device|stored on this device|content review pending|review-pending corpus|namakshar-v\d+)\b|ऑफलाइन|इंटरनेट|ऑन-डिवाइस|उपकरण पर गणना|इस उपकरण पर|इस फ़ोन पर|इसी फ़ोन पर|स्रोत-समीक्षा|नामाक्षर-v\d+|सामग्री समीक्षा शेष|समीक्षा-अधीन/iu;

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
  const violations = [...ROOTS.flatMap(sourceFiles), ...EXTRA_FILES].flatMap((file) => {
    const normalized = file.split(path.sep).join('/');
    if (ACTIONABLE_PLATFORM_EXCEPTIONS.has(normalized)) return [];
    const source = withoutComments(readFileSync(file, 'utf8'));
    const actionable = ACTIONABLE_COPY_EXCEPTIONS[normalized];
    const match = (actionable ? source.replace(actionable, '') : source).match(BANNED_CUSTOMER_COPY);
    return match ? [`${normalized}: ${match[0]}`] : [];
  });

  assert.deepEqual(violations, [], violations.join('\n'));
});
