/**
 * `InteractionManager` has ONE caller: `utils/runWhenIdle`.
 *
 * React Native 0.88 (Expo SDK 58) removes `InteractionManager`. Launch deferral,
 * artwork loading, reminder re-arming and the widget plan all lean on it, so
 * every call goes through the one helper and the upgrade changes a single file.
 * This fails when a new direct use is added.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'src');
const HELPER = path.join('utils', 'runWhenIdle.ts');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? [full] : [];
  });
}

test('no source file calls InteractionManager directly', () => {
  const offenders = sourceFiles(ROOT)
    .filter((file) => path.relative(ROOT, file) !== HELPER)
    .filter((file) => /InteractionManager\s*\.\s*\w+\s*\(/.test(fs.readFileSync(file, 'utf8')))
    .map((file) => path.relative(ROOT, file));
  assert.deepEqual(offenders, [], 'call runWhenIdle() from @/utils/runWhenIdle instead');
});

test('the helper is still a plain pass-through to the React Native API', () => {
  const helper = fs.readFileSync(path.join(ROOT, HELPER), 'utf8');
  assert.match(helper, /return InteractionManager\.runAfterInteractions\(task\)/);
});
