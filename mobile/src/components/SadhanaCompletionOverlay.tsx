import React, { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { useSadhana } from '@/contexts/SadhanaContext';
import { useSadhanaToday } from '@/data/sadhana/useSadhanaToday';
import RoutineCelebration from './RoutineCelebration';

/**
 * App-level watcher for Sankalp day completion. This mirrors the Daily Routine
 * completion overlay: the day advances when the scheduled unit is genuinely
 * completed, no matter which screen is mounted at that moment.
 */
export default function SadhanaCompletionOverlay() {
  const { lang } = useGitaLanguage();
  const cards = useSadhanaToday();
  const { commitDay, isLoading, markCelebrated, wasCelebrated } = useSadhana();
  const committedDays = useRef<Set<string>>(new Set());
  const firedProgram = useRef<string | null>(null);
  const [shower, setShower] = useState<{ caption: string; programId: string } | null>(null);

  useEffect(() => {
    for (const card of cards) {
      if (card.status.kind !== 'active' || !card.allItemsDoneToday) continue;
      const key = `${card.program.id}:${card.status.dayIndex}`;
      if (committedDays.current.has(key)) continue;
      committedDays.current.add(key);
      commitDay(card.program.id, card.status.dayIndex, card.autoVia);
    }
  }, [cards, commitDay]);

  useEffect(() => {
    if (isLoading || shower) return;
    const completed = cards.find(
      (card) => card.status.kind === 'completed' && !wasCelebrated(card.program.id)
    );
    if (!completed || firedProgram.current === completed.program.id) return;

    firedProgram.current = completed.program.id;
    const caption = contentByLang(lang, 'संकल्प पूर्ण', 'Sankalp complete');
    setShower({ caption, programId: completed.program.id });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    markCelebrated(completed.program.id);
  }, [cards, isLoading, lang, markCelebrated, shower, wasCelebrated]);

  if (!shower) return null;
  return (
    <Modal visible transparent animationType="none" presentationStyle="overFullScreen" onRequestClose={() => undefined}>
      <RoutineCelebration
        key={shower.programId}
        caption={shower.caption}
        onDone={() => setShower(null)}
      />
    </Modal>
  );
}
