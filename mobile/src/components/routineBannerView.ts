/**
 * Pure view-model for the docked RoutineBanner. Keeping the branch/label logic
 * out of the component makes the three states (nudge / progress / complete) and
 * the "celebrate once per day" gate unit-testable without a provider tree.
 */

import type { Lang } from '@/data/gita/language';
import type { SadhanaTodayCard } from '@/data/sadhana/useSadhanaToday';
import { pick } from '@/utils/localize';

export type BannerStatus = 'nudge' | 'progress' | 'complete';

export type BannerSummary = {
  hasRoutine: boolean;
  doneCount: number;
  total: number;
};

/**
 * No routine at all → nudge. A routine whose items are all done today →
 * complete. Anything else (incl. a routine with nothing scheduled today,
 * total === 0) → progress, matching the prior `complete = total > 0 && …`
 * guard so an empty day never reads as "complete".
 */
export function bannerStatus({ hasRoutine, doneCount, total }: BannerSummary): BannerStatus {
  if (!hasRoutine) return 'nudge';
  if (total > 0 && doneCount >= total) return 'complete';
  return 'progress';
}

/**
 * Fold enrolled sankalps into the routine summary so a user who only took a
 * prebuilt sankalp is not nudged to "set your daily practice". Each ongoing
 * sankalp counts as one unit of today's practice: an `active` day is done once
 * all its items are, a `done-today` day is done, and `waiting`/`completed`
 * sankalps add nothing to today's count (a finished vow alone does not hold
 * the banner off the nudge).
 */
export function withSankalps(
  routine: BannerSummary,
  cards: Pick<SadhanaTodayCard, 'status' | 'allItemsDoneToday'>[]
): BannerSummary & { sankalpOnly: boolean } {
  const ongoing = cards.filter((c) => c.status.kind !== 'completed');
  let { doneCount, total } = routine;
  for (const c of ongoing) {
    if (c.status.kind === 'active') {
      total += 1;
      if (c.allItemsDoneToday) doneCount += 1;
    } else if (c.status.kind === 'done-today') {
      total += 1;
      doneCount += 1;
    }
  }
  return {
    hasRoutine: routine.hasRoutine || ongoing.length > 0,
    doneCount,
    total,
    sankalpOnly: !routine.hasRoutine && ongoing.length > 0,
  };
}

/**
 * Single line, chosen by the active reading language (Hindi-led by default).
 * `sankalpOnly` relabels the progress line so a sankalp-only practice is not
 * called the daily routine.
 */
export function bannerLine(status: BannerStatus, lang: Lang, sankalpOnly = false): string {
  if (status === 'progress' && sankalpOnly) {
    return pick(lang, {
      hi: 'संकल्प · आज',
      en: 'Sankalp · Today',
      gu: 'સંકલ્પ · આજ',
      kn: 'ಸಂಕಲ್ಪ · ಇಂದು',
    });
  }
  switch (status) {
    case 'nudge':
      return pick(lang, {
        hi: 'अपनी नित्य साधना बनाएँ',
        en: 'Set your daily practice',
        gu: 'તમારી નિત્ય સાધના સેટ કરો',
        kn: 'ನಿಮ್ಮ ನಿತ್ಯ ಸಾಧನೆ ಹೊಂದಿಸಿ',
      });
    case 'complete':
      return pick(lang, {
        hi: 'साधना पूर्ण · आज',
        en: 'Complete for today',
        gu: 'સાધના પૂર્ણ · આજ',
        kn: 'ಸಾಧನೆ ಪೂರ್ಣ · ಇಂದು',
      });
    case 'progress':
    default:
      return pick(lang, {
        hi: 'नित्य साधना · आज',
        en: 'Daily Routine · Today',
        gu: 'નિત્ય સાધના · આજ',
        kn: 'ನಿತ್ಯ ಸಾಧನೆ · ಇಂದು',
      });
  }
}
