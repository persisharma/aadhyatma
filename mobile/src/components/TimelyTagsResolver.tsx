import { useEffect, useMemo } from 'react';
import { deityForWeekday } from '@/data/routine/vaar';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import { useTodayKey } from '@/utils/useTodayKey';
import type { TimelyContext } from '@/data/shareHashtags';

/**
 * Resolves the share date's observances + vaar deity for the Instagram hashtag
 * block (design.md §39.2), and hands them up. Renders nothing.
 *
 * ## Why this is its own module, lazily imported
 *
 * `ShareProvider` wraps the entire app, and every reader screen mounts it. When
 * these hooks lived in the provider body, `shareVerse.tsx` statically imported
 * `@/panchang/usePanchang` — dragging the festival engine, the precomputed
 * observance tables and `astronomy-engine` into the import graph of all ~24
 * reader screens. Measured cost: ~10 % on every reader test suite (13.8 s → 15.2 s
 * for one suite on a cold cache), which was enough to push unrelated
 * timing-sensitive suites past their 5 s timeouts and turn CI red.
 *
 * So the provider `React.lazy`s this module and only mounts it **while the share
 * target picker is open**. Nothing imports the panchang graph until someone is
 * actually about to share.
 *
 * ## Two costs, one fix
 *
 * The lazy boundary solves the import cost. Mounting only with the picker also
 * solves the *runtime* cost: `useObservancesForDate` runs a whole-year observance
 * solve on a cold cache, and in the provider body every app start paid for it.
 * By the time the picker opens, Home's Today strip has almost always warmed the
 * same year, so the solve is a cache read.
 *
 * On a genuinely cold cache the resolve is `InteractionManager`-deferred, so the
 * picker's first paint shows the date-free tag block and the occasion tags appear
 * a beat later. The provider keeps the resolved value after the picker closes —
 * it stays valid for the rest of the day, so a second share is instant.
 */
export default function TimelyTagsResolver({
  onResolve,
}: {
  onResolve: (t: TimelyContext) => void;
}) {
  const [calendarSystem] = usePanchangCalendarSystem();
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  const observances = useObservancesForDate(today, calendarSystem);

  useEffect(() => {
    onResolve({
      occasions: observances.map((o) => ({
        nameHi: o.rule.nameHi,
        nameEn: o.rule.nameEn,
        deityEn: o.rule.deityEn,
      })),
      weekday: today.getDay(),
      weekdayDeity: deityForWeekday(today.getDay()),
    });
  }, [observances, today, onResolve]);

  return null;
}
