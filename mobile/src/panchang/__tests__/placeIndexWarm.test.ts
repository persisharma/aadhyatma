/**
 * Opening the location sheet must not stall on the place-name index.
 *
 * The index is ~3.3 M character reads plus 165k rows. `warmPlaceIndex` used to
 * build it in one synchronous call while the sheet was opening; it now runs the
 * same build as cooperative steps, and a search that arrives first finishes
 * those steps at once.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isPlaceIndexSettled, placeIndexSteps, searchPlaces, warmPlaceIndex } from '../pincodes';

test('the build is many small steps, not one', () => {
  let steps = 0;
  const work = placeIndexSteps();
  // Count only — never finish it here, so the tests below start cold.
  while (steps < 40 && !work.next().done) steps += 1;
  work.return(null);
  assert.equal(steps, 40, 'the index build yielded fewer than 40 times');
  assert.equal(isPlaceIndexSettled(), false, 'an abandoned build leaves no half index');
});

test('warming returns at once; a search during the warm still answers correctly', async () => {
  const warm = warmPlaceIndex();
  assert.equal(isPlaceIndexSettled(), false, 'warmPlaceIndex did index work on the calling turn');
  assert.equal(warmPlaceIndex(), warm, 'a second call joins the running warm');

  // A query typed before the warm finishes completes the build synchronously.
  const early = searchPlaces('Kothimir').map((p) => p.entry.pincode);
  assert.ok(early.length > 0);
  assert.equal(isPlaceIndexSettled(), true);

  await warm;
  assert.deepEqual(searchPlaces('Kothimir').map((p) => p.entry.pincode), early, 'the finished warm changed the answers');
  assert.equal(searchPlaces('shahupuri')[0].entry.pincode, '416001');
  await warmPlaceIndex(); // a no-op once built
});
