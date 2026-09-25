import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { routeGraph, childRoutes } from './routeGraph';

const NAVIGATORS = ['HomeStackNavigator', 'MoreStackNavigator', 'PanchangStackNavigator', 'AudioStackNavigator'];
const ROOT = path.resolve(import.meta.dirname, '..');

function registeredRoutes(): Set<string> {
  const names = new Set<string>();
  for (const nav of NAVIGATORS) {
    const src = fs.readFileSync(path.join(ROOT, 'navigation', `${nav}.tsx`), 'utf8');
    for (const m of src.matchAll(/name="(\w+)"/g)) names.add(m[1]);
  }
  return names;
}

// A node:test file, so it lives beside the module rather than in __tests__/:
// Jest scans navigation/__tests__/ and fails any file there with no Jest tests.

/**
 * The graph only ORDERS the warm-up, so a missing edge is harmless — that
 * screen is warmed by the ordinary breadth-first walk instead. What is NOT
 * harmless is an edge naming a route that no longer exists: `prioritise` would
 * queue a label nothing can satisfy, and the entry it was meant to pull forward
 * would quietly never be pulled forward.
 */
test('every route in the graph is really registered on a stack', () => {
  const real = registeredRoutes();
  const unknown: string[] = [];
  for (const [route, children] of Object.entries(routeGraph)) {
    if (!real.has(route)) unknown.push(route);
    for (const child of children) if (!real.has(child)) unknown.push(`${route} -> ${child}`);
  }
  assert.deepEqual(
    unknown,
    [],
    'routeGraph names routes that no stack registers — regenerate with ' +
      '`npx tsx scripts/gen-route-graph.mts`'
  );
});

test('no route lists itself as its own child', () => {
  for (const [route, children] of Object.entries(routeGraph)) {
    assert.ok(!children.includes(route), `${route} lists itself as a child`);
  }
});

test('childRoutes is total — undefined and unknown routes give an empty list', () => {
  assert.deepEqual(childRoutes(undefined), []);
  assert.deepEqual(childRoutes('DefinitelyNotARoute'), []);
});

test('the graph actually covers the main doors out of Home', () => {
  assert.ok(Object.keys(routeGraph).length > 40, 'suspiciously few routes have children');
  assert.ok(childRoutes('Home').length > 0, 'Home should open something');
});
