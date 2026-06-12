import React, { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { useRoutines } from '@/contexts/RoutineContext';
import { bannerStatus } from './routineBannerView';
import { completionSignature, shouldCelebrateCompletion } from './routineCelebrationView';
import RoutineCelebration from './RoutineCelebration';

/**
 * App-level watcher for the routine-completion pushpa-varsha. Mounted once at the
 * navigation root so the shower plays on whatever screen the user is on the
 * moment today's routine becomes complete — whether by reading to the last page,
 * finishing the last section, or marking the final item done.
 *
 * Completion is derived live (reading progress / japa / manual marks) via
 * `useRoutineToday`, so this single watcher covers every completion path. The
 * once-per-completed-set gate lives in RoutineContext (persisted); a session ref
 * guards against a double-trigger in the render before that persist round-trips.
 */
export default function RoutineCelebrationOverlay() {
  const { lang } = useGitaLanguage();
  const { entries, doneCount, total, hasRoutine } = useRoutineToday();
  const { celebratedSignatureToday, markCelebrated } = useRoutines();

  const status = bannerStatus({ hasRoutine, doneCount, total });
  const sig = completionSignature(entries.map((e) => e.key));
  const fire = shouldCelebrateCompletion(status, sig, celebratedSignatureToday);

  const [shower, setShower] = useState<{ caption: string; sig: string } | null>(null);
  const firedSig = useRef<string | null>(null);

  useEffect(() => {
    if (!fire || firedSig.current === sig) return;
    firedSig.current = sig;
    const caption = lang === 'hi' ? 'साधना पूर्ण · आज' : 'Complete for today';
    setShower({ caption, sig });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    markCelebrated(sig);
  }, [fire, sig, lang, markCelebrated]);

  if (!shower) return null;
  return (
    <RoutineCelebration key={shower.sig} caption={shower.caption} onDone={() => setShower(null)} />
  );
}
