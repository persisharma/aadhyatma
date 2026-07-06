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

  // The smoke taps the bottom tab by its generic "Panchang" label. Maestro
  // exposes it as "Panchang, tab, N of 4", so the flow matches "Panchang, tab.*"
  // rather than a bare full-string "Panchang" (see the yaml's selector notes).
  assert.match(text, /tapOn: "Panchang, tab/);
});
