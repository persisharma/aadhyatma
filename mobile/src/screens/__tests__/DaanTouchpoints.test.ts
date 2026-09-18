/**
 * दान-पुण्य — where the giving layer is reachable from (design.md §73, TRD-42).
 *
 * PRD-26 shipped on main while the Home redesign was in flight, and put BOTH of
 * its Home doors on surfaces the redesign deletes: a 3-column grid tile and a
 * DISCOVER card, each with a hardcoded `hasNew: true`. Merging the two without
 * looking would have left the feature with only its More row — the third time
 * in one change that a deleted Home surface nearly orphaned something.
 *
 * The split that matters: the **tool** is the standing door (PRD-26 calls it
 * "the giving layer's standing Home door", and नया clears on open, so नया alone
 * could not carry it); the **नया card** is the launch announcement, and it is
 * what replaces the badge that could never clear.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const src = (...p: string[]) => fs.readFileSync(path.resolve(__dirname, '..', '..', ...p), 'utf8');

describe('दान-पुण्य discovery', () => {
  test('Home carries a standing door — a tool, not a clearing card', () => {
    expect(src('data', 'home', 'tools.ts')).toMatch(/id: 'daan'/);
    // In-stack, so Back retraces the Home journey rather than the More hub.
    expect(src('components', 'ToolsRow.tsx')).toMatch(/navigation\.navigate\('DaanPunya'\)/);
  });

  test('the launch announcement is a नया card, which clears per user', () => {
    const feed = src('data', 'home', 'featureFeed.ts');
    expect(feed).toMatch(/id: 'daan-punya'/);
    expect(feed).toMatch(/screen: 'DaanPunya'/);
  });

  test('no hardcoded NEW badge survives on the tools row', () => {
    // The two doors it replaced both set hasNew:true inline, so the badge could
    // never clear. ToolsRow passes no hasNew prop at all — the rule is about the
    // JSX, so strip the comment that explains the rule before asserting it.
    const code = src('components', 'ToolsRow.tsx').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    expect(code).not.toMatch(/hasNew/);
  });

  test('the More row and the route registration are untouched', () => {
    expect(src('screens', 'MoreScreen.tsx')).toMatch(/navigation\.navigate\('DaanPunya'\)/);
    expect(src('navigation', 'HomeStackNavigator.tsx')).toMatch(/<Stack\.Screen name="DaanPunya"/);
  });
});
