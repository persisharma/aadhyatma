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

test('panchang smoke flow asserts the generic Panchang label', () => {
  const text = readFileSync(fileURLToPath(new NodeURL('../../../.maestro/panchang-smoke.yaml', import.meta.url)), 'utf8');

  assert.match(text, /visible: "Panchang"\s+# bottom-tab label/);
});
