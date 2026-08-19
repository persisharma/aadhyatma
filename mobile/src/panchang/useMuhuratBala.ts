/**
 * Personalised Tarabala/Chandrabala for finder surfaces (PRD-16 Phase 4).
 *
 * Source of truth is the SAVED Kundali profile (`@vedansh:kundali-birth-
 * profile:v1`) — never re-asked, excluded from the derived-cache sweep by
 * name. This hook:
 *  - derives janma nakshatra + rashi at runtime from the profile's birth
 *    instant via the shipped Moon-longitude primitive (one per-session memo
 *    keyed on the profile record — an edited profile recomputes on next read);
 *  - persists NOTHING — no janma value, no bala, ever reaches storage;
 *  - resolves the day Moon's rashi at each item's best-window start, so the
 *    strip can never contradict the window the card recommends (§8.2);
 *  - returns null profile state as "no strip" — the caller renders nothing.
 *
 * ANNOTATES, NEVER RE-GRADES (§8.3): the returned map must only decorate.
 * Verdicts, ordering, tiers, follows and the share card never read it.
 */
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import {
  KUNDALI_PROFILE_STORAGE_KEY,
  birthProfileToInput,
  parseStoredBirthProfile,
  type BirthProfile,
} from './useKundali';
import { getSiderealPlanetLongitude } from './kundali';
import {
  chandrabala,
  janmaFromMoonLongitude,
  tarabala,
  type Tara,
  type TaraClass,
} from './taraChandraBala';

export type MuhuratBalaItem = {
  dateMs: number;
  /** The best window's start — the evaluation instant (§8.2). */
  windowStart: Date;
  /** The best window's nakshatra (`angaAtWindow ?? sunriseAnga` — kshaya-aware). */
  nakshatraIndex: number;
};

export type MuhuratBala = {
  tara: { tara: Tara; cls: TaraClass };
  chandra: { position: number; cls: TaraClass };
  /** So the detail strip can name what it counted from (auditable vs the Kundali screen). */
  janmaNakshatraIndex: number;
  janmaRashiIndex: number;
};

export type MuhuratBalaState = {
  /** False until the profile read lands — render nothing while false. */
  hydrated: boolean;
  /** True only with a valid saved profile; corrupt storage = guest = no strip. */
  hasProfile: boolean;
  balaByDate: ReadonlyMap<number, MuhuratBala> | null;
};

// One per-session janma memo, keyed on the profile record (§8.1): removing
// the profile stops the strip via `hasProfile`; editing it changes the key.
let janmaMemo: { key: string; nakshatraIndex: number; rashiIndex: number } | null = null;

export function janmaForProfile(profile: BirthProfile): { nakshatraIndex: number; rashiIndex: number } {
  const key = `${profile.date}|${profile.time}`;
  if (janmaMemo?.key !== key) {
    const moon = getSiderealPlanetLongitude('moon', birthProfileToInput(profile).date);
    janmaMemo = { key, ...janmaFromMoonLongitude(moon) };
  }
  return { nakshatraIndex: janmaMemo.nakshatraIndex, rashiIndex: janmaMemo.rashiIndex };
}

export function __resetJanmaMemoForTests(): void {
  janmaMemo = null;
}

/**
 * Bala for a set of listed days. `itemsKey` (identity of the item set) and a
 * navigation focus listener drive re-reads, so saving/removing the profile on
 * the Kundali screen updates the strip when the finder surface is back.
 * The Moon reads are deferred behind setTimeout(0) — the same boundary as the
 * day detail's solve — and there is at most one per rendered card.
 */
export function useMuhuratBala(items: readonly MuhuratBalaItem[]): MuhuratBalaState {
  const navigation = useNavigation();
  const [state, setState] = useState<MuhuratBalaState>({ hydrated: false, hasProfile: false, balaByDate: null });
  const [focusTick, setFocusTick] = useState(0);
  const itemsKey = items.map((i) => `${i.dateMs}:${i.windowStart.getTime()}:${i.nakshatraIndex}`).join(',');

  useEffect(() => {
    // Optional-chained: test shells mock a minimal navigation object.
    const unsubscribe = navigation.addListener?.('focus', () => setFocusTick((t) => t + 1));
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      let profile: BirthProfile | null = null;
      try {
        profile = parseStoredBirthProfile(await AsyncStorage.getItem(KUNDALI_PROFILE_STORAGE_KEY));
      } catch {
        profile = null; // storage failure = guest state, never a rendered guess
      }
      if (cancelled) return;
      if (!profile) {
        setState({ hydrated: true, hasProfile: false, balaByDate: null });
        return;
      }
      try {
        const janma = janmaForProfile(profile);
        const map = new Map<number, MuhuratBala>();
        for (const item of items) {
          const dayMoonRashi = Math.floor(getSiderealPlanetLongitude('moon', item.windowStart) / 30) % 12;
          map.set(item.dateMs, {
            tara: tarabala(janma.nakshatraIndex, item.nakshatraIndex),
            chandra: chandrabala(janma.rashiIndex, dayMoonRashi),
            janmaNakshatraIndex: janma.nakshatraIndex,
            janmaRashiIndex: janma.rashiIndex,
          });
        }
        if (!cancelled) setState({ hydrated: true, hasProfile: true, balaByDate: map });
      } catch {
        // An unusable profile behaves as guest — the shipped useKundali rule.
        if (!cancelled) setState({ hydrated: true, hasProfile: false, balaByDate: null });
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, focusTick]);

  return state;
}
