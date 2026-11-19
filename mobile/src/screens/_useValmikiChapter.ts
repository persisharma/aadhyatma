import { useCallback, useEffect, useState } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import {
  loadValmikiRamayanChapter,
  peekValmikiRamayanChapter,
  valmikiRamayanChaptersManifest,
  type ValmikiRamayanChapter,
} from '@/data/valmiki-ramayan';

export type ValmikiChapterState =
  /** The kāṇḍa is in memory. */
  | { status: 'ready'; chapter: ValmikiRamayanChapter }
  /** Being read from the bundled parts. */
  | { status: 'loading' }
  /** The parts could not be read; `retry` tries again. */
  | { status: 'failed'; retry: () => void }
  /** Not a kāṇḍa number; the reader is being sent back to its index. */
  | { status: 'invalid' };

function validChapter(raw: number | undefined): number | null {
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return null;
  return raw >= 1 && raw <= valmikiRamayanChaptersManifest.length ? raw : null;
}

/**
 * The Valmiki counterpart of `useSafeChapter`, for a corpus that is loaded
 * rather than required (see `data/valmiki-ramayan/index.ts`).
 *
 * Same contract for a bad chapter number — a stale bookmark surviving a content
 * split is redirected to the chapters index instead of crashing — plus the two
 * states a load adds: `loading`, and `failed` with a retry.
 *
 * A kāṇḍa this process has already loaded is `ready` on the FIRST render, so
 * returning to it never flashes a loading state.
 */
export function useValmikiChapter(
  rawChapter: number | undefined,
  navigation: NativeStackNavigationProp<HomeStackParamList>,
  fallbackRoute: keyof HomeStackParamList
): ValmikiChapterState {
  const chapterNumber = validChapter(rawChapter);
  const [attempt, setAttempt] = useState(0);
  // Keyed by the request it answers, so a result for one kāṇḍa (or one failed
  // attempt) can never be shown for another.
  const [settled, setSettled] = useState<
    { chapterNumber: number; attempt: number; chapter: ValmikiRamayanChapter | null } | null
  >(null);
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (chapterNumber == null) {
      // Defer to next tick so React doesn't navigate during render.
      const id = setTimeout(() => {
        (navigation.replace as (name: keyof HomeStackParamList) => void)(fallbackRoute);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [chapterNumber, navigation, fallbackRoute]);

  useEffect(() => {
    if (chapterNumber == null || peekValmikiRamayanChapter(chapterNumber)) return undefined;
    let live = true;
    loadValmikiRamayanChapter(chapterNumber).then(
      (chapter) => {
        if (live) setSettled({ chapterNumber, attempt, chapter });
      },
      () => {
        if (live) setSettled({ chapterNumber, attempt, chapter: null });
      }
    );
    return () => {
      live = false;
    };
  }, [chapterNumber, attempt]);

  if (chapterNumber == null) return { status: 'invalid' };
  const loaded = peekValmikiRamayanChapter(chapterNumber);
  if (loaded) return { status: 'ready', chapter: loaded };
  if (settled && settled.chapterNumber === chapterNumber && settled.attempt === attempt && !settled.chapter) {
    return { status: 'failed', retry };
  }
  return { status: 'loading' };
}
