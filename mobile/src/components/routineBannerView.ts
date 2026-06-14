/**
 * Pure view-model for the docked RoutineBanner. Keeping the branch/label logic
 * out of the component makes the three states (nudge / progress / complete) and
 * the "celebrate once per day" gate unit-testable without a provider tree.
 */

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
export function bannerLine(status: BannerStatus, isHi: boolean): string {
  switch (status) {
    case 'nudge':
      return isHi ? 'अपनी नित्य साधना बनाएँ' : 'Set your daily practice';
    case 'complete':
      return isHi ? 'साधना पूर्ण · आज' : 'Complete for today';
    case 'progress':
    default:
      return isHi ? 'नित्य साधना · आज' : 'Daily Routine · Today';
  }
}
