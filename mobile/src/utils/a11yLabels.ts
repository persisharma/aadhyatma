import type { Lang } from '@/data/gita/language';
import { pick } from './localize';

/**
 * Shared, localized screen-reader labels for controls that repeat across screens.
 * Wording matches the existing hand-authored Back labels (CreateRoutineScreen,
 * RoutineShell, ReminderSettingsScreen). Grid-tile labels are NOT here: they stay
 * English on purpose for the e2e suite.
 */
export function backLabel(lang: Lang): string {
  return pick(lang, { hi: 'वापस', en: 'Back', gu: 'પાછા', kn: 'ಹಿಂದೆ' });
}
