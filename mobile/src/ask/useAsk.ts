/**
 * The UI's door to जिज्ञासा. Loads the engine through a dynamic `import()` so
 * nothing under `src/ask/` (registries, panchang engine) reaches the launch
 * graph — PRD-25 §13.7 — and warms the lexicon the moment the search surface
 * mounts, so the first keystroke is free.
 *
 * Context is assembled here from the same hooks every daily surface already
 * uses: the Panchang location, the calendar system, the reading language, and
 * the active sankalps (for `sadhana.progress`).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { useGitaLanguage } from '@/data/gita/language';
import { useSadhanaToday } from '@/data/sadhana/useSadhanaToday';
import type { AskEngine } from './engine';
import type { AskContext, AskResolution, Localized, SadhanaSummary } from './types';

export type UseAskResult = {
  /** False until the engine module has loaded (one dynamic import, once). */
  ready: boolean;
  /** Resolve a question now, or null while the engine is still loading. */
  ask: (question: string) => AskResolution | null;
  /** Cheap syntactic check — safe to call before `ready`. */
  looksLikeQuestion: (question: string) => boolean;
  /** Example questions for chips / the rotating placeholder. */
  examples: readonly Localized[];
};

let enginePromise: Promise<AskEngine> | null = null;
function loadEngine(): Promise<AskEngine> {
  if (!enginePromise) {
    enginePromise = import('./engine').then((m) => {
      m.warmAsk();
      return m.engine;
    });
  }
  return enginePromise;
}

/** Test seam: forget the cached engine module. */
export function __resetAskEngineForTests(): void {
  enginePromise = null;
}

/** Conservative fallback while the engine has not loaded: a trailing "?" only. */
function cheapLooksLikeQuestion(q: string): boolean {
  return q.trim().endsWith('?');
}

/**
 * The AskContext every ask surface shares — location, calendar system, reading
 * language, active sankalps — as a builder so `now` is read at ask time.
 */
export function useAskContextBuilder(): (seed?: AskContext['seed']) => AskContext {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const { lang } = useGitaLanguage();
  const sadhanaCards = useSadhanaToday();

  const sadhana = useMemo<SadhanaSummary[]>(
    () =>
      sadhanaCards.map((c) => {
        const s = c.status;
        const total = s.totalDays;
        const dayIndex =
          s.kind === 'active' || s.kind === 'done-today' ? s.dayIndex : s.kind === 'waiting' ? Math.min(s.doneCount + 1, total) : total;
        return {
          programId: c.program.id,
          titleHi: c.program.titleHi,
          titleEn: c.program.titleEn,
          dayIndex,
          total,
          doneToday: s.kind === 'done-today' || c.allItemsDoneToday,
        };
      }),
    [sadhanaCards]
  );

  return useCallback(
    (seed?: AskContext['seed']): AskContext => ({
      now: new Date(),
      location,
      calendarSystem,
      lang,
      sadhana,
      ...(seed ? { seed } : {}),
    }),
    [location, calendarSystem, lang, sadhana]
  );
}

export function useAsk(seed?: AskContext['seed']): UseAskResult {
  const [engine, setEngine] = useState<AskEngine | null>(null);
  const buildContext = useAskContextBuilder();

  useEffect(() => {
    let cancelled = false;
    loadEngine().then((e) => {
      if (!cancelled) setEngine(e);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const seedType = seed?.type;
  const seedId = seed?.id;

  const ask = useCallback(
    (question: string): AskResolution | null => {
      if (!engine) return null;
      return engine.askQuestion(question, buildContext(seedType && seedId ? { type: seedType, id: seedId } : undefined));
    },
    [engine, buildContext, seedType, seedId]
  );

  const examples = useMemo(() => (engine ? engine.askExamples() : []), [engine]);

  return {
    ready: engine != null,
    ask,
    looksLikeQuestion: engine ? engine.looksLikeQuestion : cheapLooksLikeQuestion,
    examples,
  };
}
