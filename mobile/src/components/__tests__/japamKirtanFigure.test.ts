import assert from 'node:assert/strict';
import { KIRTAN_ART_READY, KIRTAN_BEAT_MS, kirtanFigureFor, kirtanStyleAvailable } from '../japamKirtanFigure';
import { japamMantras } from '@/data/japam';

test('the dancer follows the mantra: Hanuman for Ram naam, a child for Krishna/Radha, a sadhu otherwise', () => {
  assert.equal(kirtanFigureFor(['rama']), 'hanuman');
  assert.equal(kirtanFigureFor(['hanuman']), 'hanuman');
  assert.equal(kirtanFigureFor(['krishna']), 'child');
  assert.equal(kirtanFigureFor(['radha']), 'child');
  assert.equal(kirtanFigureFor(['shiva']), 'sadhu');
  assert.equal(kirtanFigureFor(['savitr']), 'sadhu');
  assert.equal(kirtanFigureFor(['surya', 'navagraha']), 'sadhu');
});

test('every list mantra resolves to a figure', () => {
  const figures = new Set(japamMantras.map((m) => kirtanFigureFor(m.deities)));
  assert.deepEqual([...figures].sort(), ['child', 'hanuman', 'sadhu']);
});

test('placeholder figures are never offered in a release build', () => {
  assert.equal(KIRTAN_ART_READY, false, 'flip only when painted layered art is integrated (design.md §35.2)');
  assert.equal(kirtanStyleAvailable(false, undefined), false);
  assert.equal(kirtanStyleAvailable(false, '0'), false);
  assert.equal(kirtanStyleAvailable(true, undefined), true);
  assert.equal(kirtanStyleAvailable(false, '1'), true);
  assert.equal(KIRTAN_BEAT_MS, 880);
});
