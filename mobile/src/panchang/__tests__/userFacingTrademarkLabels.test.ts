import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath, URL as NodeURL } from 'node:url';

const userFacingFiles = [
  ['Panchang screen', fileURLToPath(new NodeURL('../../screens/PanchangScreen.tsx', import.meta.url))],
  ['More screen', fileURLToPath(new NodeURL('../../screens/MoreScreen.tsx', import.meta.url))],
  ['Panchang smoke flow', fileURLToPath(new NodeURL('../../../.maestro/panchang-smoke.yaml', import.meta.url))],
] as const;

test('user-facing panchang labels avoid the Drik Panchang trademark phrase', () => {
  for (const [label, url] of userFacingFiles) {
    const text = readFileSync(url, 'utf8');

    assert.doesNotMatch(text, /Drik Panchang|दृक् पंचांग/, label);
  }
});

test('panchang smoke flow drives the generic Panchang tab label', () => {
  const text = readFileSync(fileURLToPath(new NodeURL('../../../.maestro/panchang-smoke.yaml', import.meta.url)), 'utf8');

  // The smoke opens the tab by its stable testID, never by a trademarked label.
  // This was "Panchang, tab.*" (the iOS a11y label) until #224 moved all 49 tab
  // selectors onto `id: tab-*` for Android parity — the guard follows the flow.
  assert.match(text, /tapOn: \{ id: "tab-panchang" \}/);
});
