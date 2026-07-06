/**
 * Pure view-model for the docked RoutineBanner. Keeping the branch/label logic
 * out of the component makes the three states (nudge / progress / complete) and
 * the "celebrate once per day" gate unit-testable without a provider tree.
 */

import type { Lang } from '@/data/gita/language';
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

/** Single line, chosen by the active reading language (Hindi-led by default). */
export function bannerLine(status: BannerStatus, lang: Lang): string {
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
