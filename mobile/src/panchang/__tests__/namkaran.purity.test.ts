import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('Namkaran engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/namkaran.ts', 'utf8');
  assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)/);
});
