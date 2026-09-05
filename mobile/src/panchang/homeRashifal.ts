/**
 * The राशिफल row on Home's Today card (design.md §48): one line naming the
 * active person's Moon sign and the day's theme, resolved from the roster the
 * Jyotish landing already keeps. PURE — the caller passes the roster snapshot
 * and the instant; nothing here reads storage, the clock, or React.
 *
 * Loaded by `TodayStrip` through a dynamic `import()` and computed behind
 * `InteractionManager`, exactly like the जिज्ञासा briefing: a Kundali chart is a
 * full nine-graha solve plus a Lagna root-find, and the Rashifal is nine more
 * sidereal longitudes — none of it belongs on Home's launch path, and the
 * dynamic import keeps `kundali.ts`' chart code off the static launch graph
 * (`launchGraph.test.ts`).
 *
 * The theme line is deliberately NOT a prediction: it names the house theme the
 * day's supportive transit points at (`HOUSE_THEME_*`, the same vocabulary the
 * Favour row uses), so the card says what the full Rashifal says — nothing more.
 */
import type { ProfileRoster } from './birthProfiles';
import { activePerson, birthProfileToInput } from './birthProfiles';
import {
  computeKundali,
  computeRashifal,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type RashifalGuidance,
} from './kundali';

export type HomeRashifal = {
  rashiIndex: number;
  rashiHi: string;
  rashiEn: string;
  /** Plain-English equivalent (Aries…) beside the traditional name, en only. */
  rashiWestern: string;
  /** One-line day theme — `<house theme> का दिन` / `a day for <house theme>`. */
  themeHi: string;
  themeEn: string;
  /** The active person's name, only when the roster holds more than one person
   * (a solo roster keeps the shipped "your" phrasing — §51a naming rule). */
  personName: string | null;
  guidance: RashifalGuidance;
};

export function composeHomeRashifal(roster: ProfileRoster, date: Date): HomeRashifal | null {
  const person = activePerson(roster);
  if (!person) return null;
  const chart = computeKundali(birthProfileToInput(person));
  const moon = chart.grahas.find((g) => g.graha === 'moon');
  if (!moon) return null;
  const guidance = computeRashifal(date, moon.rashiIndex);
  const theme = guidance.favourHouse - 1;
  const named = roster.people.length > 1 && person.name?.trim() ? person.name.trim() : null;
  return {
    rashiIndex: moon.rashiIndex,
    rashiHi: RASHI_NAMES_HI[moon.rashiIndex],
    rashiEn: RASHI_NAMES_EN[moon.rashiIndex],
    rashiWestern: RASHI_NAMES_WESTERN[moon.rashiIndex],
    themeHi: `${HOUSE_THEME_HI[theme]} का दिन`,
    themeEn: `a day for ${HOUSE_THEME_EN[theme]}`,
    personName: named,
    guidance,
  };
}

export const homeRashifal = { composeHomeRashifal };
export type HomeRashifalModule = typeof homeRashifal;
