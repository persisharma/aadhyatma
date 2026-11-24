import type { Lang } from './language';

/**
 * Every supported language code, in toggle order. Lives outside `language.tsx`
 * (which many tests mock with only the hook) so pure helpers that iterate every
 * language keep working under those mocks. Must match `LANGUAGES` order.
 */
export const LANG_VALUES: readonly Lang[] = ['hi', 'en', 'gu', 'kn', 'mr', 'te'];

export function isLangValue(v: unknown): v is Lang {
  return typeof v === 'string' && (LANG_VALUES as readonly string[]).includes(v);
}
