import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * `FestiveReminderScheduler` runs on every launch, inside the deferred batch that
 * also holds Home's first taps. Its two Pitru Paksha windows must come from the
 * persisted `pitruSmaranSolves` layer (hydrate → solve only what disk lacks →
 * persist), never from the raw engine: `pitruPakshaWindow` is a ~75 ms scan on a
 * desktop JIT and several hundred ms unyielded on Hermes, and the engine's memo is
 * per-process — so a direct call re-solved next year's window on every cold start.
 * Same rule the panchang wiki states for every engine entry point reachable from a
 * launch surface.
 */
test('the festive scheduler reaches Pitru Paksha windows only through the persisted solves layer', () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'src/components/FestiveReminderScheduler.tsx'),
    'utf8'
  );
  assert.doesNotMatch(source, /pitruPakshaWindow\(/, 'call ensurePakshaWindow, not the engine');
  assert.doesNotMatch(source, /from '@\/panchang\/pitruSmaran'/, 'the engine module must not be imported here');
  assert.match(source, /hydrateSmaranSolves\(\[\], today\)/, 'disk first');
  assert.match(source, /ensurePakshaWindow\(year\)/, 'solve through the record');
  assert.match(source, /persistSmaranSolves\(\)/, 'persist what was solved');
  // The hydrate is awaited before the windows are read, so a warm device never solves.
  const hydrate = source.indexOf('await hydrateSmaranSolves');
  const solve = source.indexOf('ensurePakshaWindow(year)');
  assert.ok(hydrate > 0 && solve > hydrate, 'hydrate must precede the solve');
});
