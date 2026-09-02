/**
 * Bridges the pure `upvasParana` derivation to the shared, persisted
 * `panchangDayStore` for the Observance Detail's उपवास विधि panel (PRD-09
 * Phase 4 §5.2). Same discipline as `useMuhurat`:
 * - the day solve comes from the SHARED store (never a private cache), keyed
 *   by the user's real `PanchangLocationContext` scope;
 * - nothing is persisted about the parana itself — like a muhurat follow's
 *   window, a stored parana time lies the moment the user changes city, so
 *   the display is re-derived per render from the store's days;
 * - hydration (I/O) starts immediately; only astronomy for a day disk did not
 *   have waits behind `InteractionManager` + one macrotask, after first paint;
 * - nothing runs while the location/calendar-system scope is a placeholder.
 *
 * A `text-only` rule (or no rule, or no occurrence) does no work at all and
 * returns null — the verified rule text renders alone.
 */
import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarHydrated, usePanchangCalendarSystem } from '@/panchang/usePanchang';
import {
  cachedDayInputs,
  dateKeyFor,
  dayAt,
  dayStoreFor,
  scopeKeyFor,
  type ScanOptions,
} from '@/panchang/panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from '@/panchang/panchangDayCache';
import { deriveUpvasParana, type UpvasParanaDisplay } from '@/panchang/upvasParana';
import type { PanchangData, UpvasParanaRule } from '@/panchang/types';

/** The one civil day each computable kind needs; null for text-only. */
function neededDay(parana: UpvasParanaRule, occurrence: Date): Date | null {
  if (parana.kind === 'same-day-after-moonrise') return dayAt(occurrence, 0);
  if (parana.kind === 'next-day-sunrise-tithi-bound') return dayAt(occurrence, 1);
  return null;
}

function compose(
  parana: UpvasParanaRule,
  day: Date,
  opts: ScanOptions,
  allowSolve: boolean
): UpvasParanaDisplay | null {
  const map = dayStoreFor(scopeKeyFor(opts.location, opts.calendarSystem));
  let solved: PanchangData | null;
  if (allowSolve) {
    solved = cachedDayInputs(map, day, opts).inputs.p;
  } else {
    solved = map.get(dateKeyFor(day))?.p ?? null;
  }
  if (!solved) return null;
  // The same solved day serves both computable kinds; the pure helper picks
  // the field it needs and nulls out every dishonest branch.
  return parana.kind === 'same-day-after-moonrise'
    ? deriveUpvasParana(parana, solved, null)
    : deriveUpvasParana(parana, null, solved);
}

/**
 * The computed parana display for a verified upvas entry's rule at the user's
 * Panchang location, or null while it is unavailable (text-only kind, solve in
 * flight, or an honest derivation miss).
 */
export function useUpvasParana(
  parana: UpvasParanaRule | null | undefined,
  occurrenceDate: Date | null
): UpvasParanaDisplay | null {
  const { location, isLoading: locationLoading } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const calendarHydrated = usePanchangCalendarHydrated();
  const scopeSettled = !locationLoading && calendarHydrated;

  const day = parana && occurrenceDate ? neededDay(parana, occurrenceDate) : null;
  const scope = scopeKeyFor(location, calendarSystem);
  const cacheKey = `${scope}|${day ? dateKeyFor(day) : 'none'}|${parana?.kind ?? 'none'}`;

  // Seed cache-only so an already-solved day paints without a null flash.
  const [display, setDisplay] = useState<UpvasParanaDisplay | null>(() =>
    parana && day ? compose(parana, day, { calendarSystem, location }, false) : null
  );

  useEffect(() => {
    if (!parana || !day) {
      setDisplay(null);
      return;
    }
    const opts: ScanOptions = { calendarSystem, location };
    const warm = compose(parana, day, opts, false);
    setDisplay(warm);
    if (warm || !scopeSettled) return;

    let cancelled = false;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    let handle: ReturnType<typeof setTimeout> | undefined;

    void (async () => {
      // Disk first, immediately — I/O needs no idle UI (useMuhurat's split).
      await hydratePanchangDays(location, calendarSystem, [dateKeyFor(day)]);
      if (cancelled) return;
      const hydrated = compose(parana, day, opts, false);
      if (hydrated) {
        setDisplay(hydrated);
        return;
      }
      // The day was not on disk: solve it, but only once the UI is idle.
      interaction = InteractionManager.runAfterInteractions(() => {
        handle = setTimeout(() => {
          if (cancelled) return;
          try {
            setDisplay(compose(parana, day, opts, true));
            void persistPanchangDays(location, calendarSystem);
          } catch {
            /* invalid input — leave null; the rule text renders alone */
          }
        }, 0);
      });
    })();

    return () => {
      cancelled = true;
      interaction?.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, scopeSettled]);

  return display;
}
